import { getSafeAreaInsetsValue, defaultSafeAreaInsets } from '../src/ui/components/safeArea';

describe('safe area fallback', () => {
  it('returns default insets when the safe area hook throws', () => {
    const result = getSafeAreaInsetsValue(() => {
      throw new Error('No safe area value available');
    });

    expect(result).toEqual(defaultSafeAreaInsets);
  });
});
