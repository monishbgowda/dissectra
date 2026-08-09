/**
 * Calculates a composite confidence score based on AI output, multi-view evidence,
 * completeness of the response, and structural consistency.
 *
 * Weights:
 * - AI Confidence: 40%
 * - Multi-View Evidence: 25%
 * - Completeness: 15%
 * - Consistency: 20%
 */

function clamp(value, min = 0, max = 1) {
    if (typeof value !== 'number' || isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
}

function calculateCompositeConfidence(analysis, imageCount) {
    if (!analysis || typeof analysis !== 'object') {
        return {
            finalConfidence: 0,
            breakdown: {
                aiConfidence: 0,
                multiViewEvidence: 0,
                completeness: 0,
                consistency: 0
            }
        };
    }

    // 1. AI Confidence (40%)
    // Safely extract from analysis.product.confidence
    let aiConf = 0;
    if (analysis.product && typeof analysis.product.confidence === 'number') {
        aiConf = clamp(analysis.product.confidence);
    }
    
    // 2. Multi-View Evidence (25%)
    // Deterministic based on up to 3 images: min(imageCount / 3, 1)
    let imgCount = typeof imageCount === 'number' && !isNaN(imageCount) ? imageCount : 0;
    let multiViewEvidence = clamp(imgCount / 3);

    // 3. Completeness (15%)
    let completeness = calculateCompleteness(analysis);

    // 4. Consistency (20%)
    let consistency = calculateConsistency(analysis);

    // Final Score Calculation
    let finalConfidence = 
        (aiConf * 0.40) + 
        (multiViewEvidence * 0.25) + 
        (completeness * 0.15) + 
        (consistency * 0.20);
        
    finalConfidence = clamp(finalConfidence);

    return {
        finalConfidence,
        breakdown: {
            aiConfidence: aiConf,
            multiViewEvidence,
            completeness,
            consistency
        }
    };
}

function calculateCompleteness(analysis) {
    // Defines the 10 fields we expect from a good Gemini response
    const expectedFields = [
        // Product fields
        { check: (a) => a.product && typeof a.product.name === 'string' && a.product.name.trim() !== '' },
        { check: (a) => a.product && typeof a.product.brand === 'string' && a.product.brand.trim() !== '' },
        { check: (a) => a.product && typeof a.product.model === 'string' && a.product.model.trim() !== '' },
        { check: (a) => a.product && typeof a.product.category === 'string' && a.product.category.trim() !== '' },
        
        // Top level arrays/objects
        { check: (a) => Array.isArray(a.components) && a.components.length > 0 },
        { check: (a) => Array.isArray(a.materials) && a.materials.length > 0 },
        { check: (a) => Array.isArray(a.manufacturing) && a.manufacturing.length > 0 },
        { check: (a) => Array.isArray(a.damage) }, // Damage can be empty if pristine, just check array exists
        { check: (a) => a.engineering && typeof a.engineering === 'object' && Object.keys(a.engineering).length > 0 },
        { check: (a) => typeof a.summary === 'string' && a.summary.trim() !== '' }
    ];

    let score = 0;
    for (let rule of expectedFields) {
        try {
            if (rule.check(analysis)) {
                score += 1;
            }
        } catch (e) {
            // Ignore error, treat as check failed
        }
    }

    return clamp(score / expectedFields.length);
}

function calculateConsistency(analysis) {
    let consistencyScore = 1.0;
    
    const deduct = (amount) => {
        consistencyScore -= amount;
    };

    // Rule 1: Product confidence should be valid [0, 1]
    if (analysis.product) {
        if (typeof analysis.product.confidence === 'number') {
            if (analysis.product.confidence < 0 || analysis.product.confidence > 1) {
                deduct(0.2);
            }
        } else {
            // Missing/invalid product confidence type
            deduct(0.1); 
        }
    }

    // Rule 2: Components should have names/ids and valid confidences
    if (Array.isArray(analysis.components) && analysis.components.length > 0) {
        let malformedComponents = 0;
        for (let comp of analysis.components) {
            let isMalformed = false;
            // Should have some identifying text
            if (!comp.id && !comp.name) {
                isMalformed = true;
            }
            // Confidence should be [0, 1]
            if (typeof comp.confidence === 'number' && (comp.confidence < 0 || comp.confidence > 1)) {
                isMalformed = true;
            }
            
            if (isMalformed) malformedComponents++;
        }
        
        if (malformedComponents > 0) {
            // Deduct up to 0.4 based on proportion of malformed components
            let penalty = (malformedComponents / analysis.components.length) * 0.4;
            deduct(penalty);
        }
    }

    // Rule 3: Materials should be structured properly (has name property)
    if (Array.isArray(analysis.materials)) {
        let invalidMaterials = 0;
        for (let mat of analysis.materials) {
            if (!mat.name || typeof mat.name !== 'string') {
                invalidMaterials++;
            }
        }
        if (invalidMaterials > 0) {
            deduct(0.2);
        }
    }
    
    // Rule 4: Damage should be structured properly if it has elements
    if (Array.isArray(analysis.damage)) {
        let invalidDamage = 0;
        for (let d of analysis.damage) {
            if (typeof d.confidence === 'number' && (d.confidence < 0 || d.confidence > 1)) invalidDamage++;
            if (!d.component && !d.type) invalidDamage++;
        }
        if (invalidDamage > 0) {
            deduct(0.2);
        }
    }

    return clamp(consistencyScore);
}

module.exports = {
    calculateCompositeConfidence
};
