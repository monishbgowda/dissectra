import React, {
  useState,
} from 'react';

import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';

import Icon from
  'react-native-vector-icons/Ionicons';

import {
  AppScreen,
} from '../components/AppScreen';

import {
  LoadingState,
} from '../components/LoadingState';

import {
  useTheme,
} from '../../theme/ThemeProvider';

import {
  runScanPipeline,
} from '../../services/scanPipeline';

import {
  copyToStorage,
  saveScan,
} from '../../storage/localStorage';

import type {
  StoredScan,
} from '../../types/dissectra';

import {
  MAX_IMAGE_BYTES,
} from '../../config/env';


/* --------------------------------------------------
   TYPES
-------------------------------------------------- */

interface ImageAssetInfo {
  uri: string;

  fileName?: string;

  fileSize?: number;

  type?: string;
}


/* --------------------------------------------------
   UUID
-------------------------------------------------- */

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(
      /[xy]/g,
      c => {
        const r =
          Math.floor(
            Math.random() * 16,
          );

        const v =
          c === 'x'
            ? r
            : (r & 0x3) | 0x8;

        return v.toString(16);
      },
    );
}


/* --------------------------------------------------
   SCREEN
-------------------------------------------------- */

export function CaptureScreen({
  navigation,
}: any) {
  const { theme } = useTheme();

  const { width, height } =
    useWindowDimensions();

  const isLandscape =
    width > height;

  const styles =
    createStyles(
      theme,
      isLandscape,
    );

  const [assets, setAssets] =
    useState<ImageAssetInfo[]>([]);

  const [loading, setLoading] =
    useState(false);


  /*
   * The latest captured/selected image
   * becomes the large preview.
   */
  const selected =
    assets.length > 0
      ? assets[assets.length - 1]
      : undefined;


  /* ------------------------------------------------
     IMAGE OPTIONS
  ------------------------------------------------ */

  const options:
    ImageLibraryOptions &
    CameraOptions = {
      mediaType: 'photo',

      quality: 0.8,

      maxWidth: 1920,

      maxHeight: 1920,

      /*
       * Captures remain in app storage.
       *
       * We do NOT automatically put
       * every photo into the user's gallery.
       */
      saveToPhotos: false,
    };


  /* ------------------------------------------------
     CAMERA PERMISSION
  ------------------------------------------------ */

  async function ensureCameraPermission() {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const permission =
        PermissionsAndroid.PERMISSIONS.CAMERA;

      const alreadyGranted =
        await PermissionsAndroid.check(
          permission,
        );

      if (alreadyGranted) {
        return true;
      }

      const result =
        await PermissionsAndroid.request(
          permission,
          {
            title:
              'Camera Permission',

            message:
              'Dissectra needs camera access to photograph objects for analysis.',

            buttonPositive:
              'Allow',

            buttonNegative:
              'Cancel',
          },
        );

      if (
        result ===
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      }

      Alert.alert(
        'Camera permission required',
        'Camera access is required to capture an object. You can enable it from Android Settings.',
      );

      return false;
    } catch (error: any) {
      Alert.alert(
        'Permission error',
        error?.message ||
          'Unable to request camera permission.',
      );

      return false;
    }
  }


  /* ------------------------------------------------
     VALIDATE IMAGE
  ------------------------------------------------ */

  function isValidImage(
    image: {
      fileSize?: number;
    },
  ) {
    if (
      image.fileSize &&
      image.fileSize >
        MAX_IMAGE_BYTES
    ) {
      Alert.alert(
        'Image too large',

        `Please choose an image smaller than ${Math.round(
          MAX_IMAGE_BYTES /
            1024 /
            1024,
        )} MB.`,
      );

      return false;
    }

    return true;
  }


  /* ------------------------------------------------
     SINGLE CAMERA CAPTURE

     We APPEND the image instead of replacing
     previous captures.

     This allows:
       Photo 1
       Photo 2
       Photo 3
  ------------------------------------------------ */

  async function capturePhoto() {
    if (loading) {
      return;
    }

    try {
      const granted =
        await ensureCameraPermission();

      if (!granted) {
        return;
      }

      const result =
        await launchCamera(
          options,
        );

      if (
        result.didCancel ||
        !result.assets?.length
      ) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Camera error',

          result.errorMessage ||
            'Unable to capture image.',
        );

        return;
      }

      const image =
        result.assets[0];

      if (!image?.uri) {
        return;
      }

      if (!isValidImage(image)) {
        return;
      }

      const captured:
        ImageAssetInfo = {
          uri: image.uri,

          fileName:
            image.fileName,

          fileSize:
            image.fileSize,

          type:
            image.type,
        };

      /*
       * Maximum three angle captures,
       * matching the approved UI.
       *
       * Once three exist, the next capture
       * replaces the oldest one.
       */
      setAssets(previous => {
        if (
          previous.length >= 3
        ) {
          return [
            ...previous.slice(1),
            captured,
          ];
        }

        return [
          ...previous,
          captured,
        ];
      });
    } catch (error: any) {
      Alert.alert(
        'Capture failed',

        error?.message ||
          'Please try again.',
      );
    }
  }


  /* ------------------------------------------------
     GALLERY

     Uses Android/iOS system picker.

     On supported Android versions this does
     not require broad gallery/storage access.
  ------------------------------------------------ */

  async function openGallery() {
    if (loading) {
      return;
    }

    try {
      const galleryOptions:
        ImageLibraryOptions = {
          mediaType: 'photo',

          quality: 0.8,

          maxWidth: 1920,

          maxHeight: 1920,

          /*
           * User may select up to
           * three object angles.
           */
          selectionLimit: 3,
        };

      const result =
        await launchImageLibrary(
          galleryOptions,
        );

      if (
        result.didCancel ||
        !result.assets?.length
      ) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Gallery error',

          result.errorMessage ||
            'Unable to open gallery.',
        );

        return;
      }

      const mapped:
        ImageAssetInfo[] =
        result.assets
          .filter(
            image =>
              !!image.uri &&
              isValidImage(
                image,
              ),
          )
          .slice(0, 3)
          .map(image => ({
            uri: image.uri!,

            fileName:
              image.fileName,

            fileSize:
              image.fileSize,

            type:
              image.type,
          }));

      if (
        mapped.length === 0
      ) {
        return;
      }

      setAssets(mapped);
    } catch (error: any) {
      Alert.alert(
        'Image selection failed',

        error?.message ||
          'Please try again.',
      );
    }
  }


  /* ------------------------------------------------
     DELETE / REMOVE ONE SNAPSHOT
  ------------------------------------------------ */

  function removeAssetAt(
    index: number,
  ) {
    Alert.alert(
      'Remove snapshot?',

      'This snapshot will be removed from the current scan.',

      [
        {
          text: 'Cancel',

          style: 'cancel',
        },

        {
          text: 'Remove',

          style: 'destructive',

          onPress: () => {
            setAssets(
              previous =>
                previous.filter(
                  (_, i) =>
                    i !== index,
                ),
            );
          },
        },
      ],
    );
  }


  /* ------------------------------------------------
     CLEAR CURRENT CAPTURE SESSION
  ------------------------------------------------ */

  function clearSelection() {
    if (
      assets.length === 0
    ) {
      return;
    }

    Alert.alert(
      'Clear snapshots?',

      'Remove all selected snapshots from this scan?',

      [
        {
          text: 'Cancel',

          style: 'cancel',
        },

        {
          text: 'Clear',

          style: 'destructive',

          onPress: () =>
            setAssets([]),
        },
      ],
    );
  }


  /* ------------------------------------------------
     ANALYSIS PIPELINE

     This preserves your original working
     runScanPipeline implementation.
  ------------------------------------------------ */

  async function process() {
    if (
      assets.length === 0 ||
      loading
    ) {
      return;
    }

    setLoading(true);

    try {
      /*
       * The primary image enters the
       * existing Dissectra AI pipeline.
       */
      const primaryImage =
        assets[0];

      const result =
        await runScanPipeline(
          primaryImage.uri,
        );


      /*
       * Preserve additional snapshots
       * using the CURRENT data model.
       *
       * Later we will migrate StoredScan
       * so all snapshots belong to one
       * parent scan.
       */
      if (
        assets.length > 1
      ) {
        for (
          let index = 1;
          index <
          assets.length;
          index++
        ) {
          const image =
            assets[index];

          const id =
            uuidv4();

          const ext =
            image.fileName
              ?.split('.')
              .pop() ||
            'jpg';

          const filename =
            `${id}.${ext}`;

          const localPath =
            await copyToStorage(
              image.uri,

              'images',

              filename,
            );

          const additionalScan:
            StoredScan = {
              id,

              imageUri:
                image.uri,

              localImagePath:
                localPath,

              analysis: {
                object:
                  result
                    .analysis
                    .object,

                description:
                  'Additional snapshot captured for this scan.',

                labels:
                  result
                    .analysis
                    .labels,

                confidence:
                  result
                    .analysis
                    .confidence,
              },

              createdAt:
                new Date()
                  .toISOString(),

              status:
                'processing',
            };

          await saveScan(
            additionalScan,
          );
        }
      }

      navigation.navigate(
        'Home',

        {
          scan: result,
        },
      );
    } catch (error: any) {
      Alert.alert(
        'Processing failed',

        error?.message ||
          'The scan could not be processed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }


  /* ------------------------------------------------
     UI
  ------------------------------------------------ */

  return (
    <AppScreen>
      <ScrollView
        style={styles.screenScroll}
        contentContainerStyle={
          styles.screenContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <Pressable
          onPress={() =>
            navigation.goBack()
          }

          hitSlop={12}
        >
          <Icon
            name="chevron-back"

            size={27}

            color={
              theme.colors.text
            }
          />
        </Pressable>


        <Text
          style={
            styles.headerTitle
          }
        >
          Capture
        </Text>


        {assets.length > 0 ? (
          <Pressable
            onPress={
              clearSelection
            }

            hitSlop={12}
          >
            <Icon
              name="trash-outline"

              size={23}

              color={
                theme.colors.text
              }
            />
          </Pressable>
        ) : (
          <View
            style={{
              width: 27,
            }}
          />
        )}
      </View>


      {/* INSTRUCTIONS */}

      <View
        style={
          styles.instructions
        }
      >
        <Text
          style={
            styles.instructionTitle
          }
        >
          Center the object
        </Text>

        <Text
          style={
            styles.instructionSubtitle
          }
        >
          Make sure the object is well lit
        </Text>
      </View>


      {/* CAMERA / IMAGE FRAME */}

      <View
        style={
          styles.cameraFrame
        }
      >
        {selected?.uri ? (
          <Image
            source={{
              uri:
                selected.uri,
            }}

            style={
              styles.preview
            }

            resizeMode="cover"
          />
        ) : (
          <View
            style={
              styles.emptyCamera
            }
          >
            <Icon
              name="scan-outline"

              size={54}

              color={
                theme.colors
                  .textSecondary
              }
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Position an object
            </Text>

            <Text
              style={
                styles.emptySubtitle
              }
            >
              Keep the entire object inside the frame
            </Text>
          </View>
        )}


        {/* GRID */}

        <View
          pointerEvents="none"

          style={styles.grid}
        >
          <View
            style={[
              styles.verticalGrid,

              {
                left:
                  '33.33%',
              },
            ]}
          />

          <View
            style={[
              styles.verticalGrid,

              {
                left:
                  '66.66%',
              },
            ]}
          />

          <View
            style={[
              styles.horizontalGrid,

              {
                top:
                  '33.33%',
              },
            ]}
          />

          <View
            style={[
              styles.horizontalGrid,

              {
                top:
                  '66.66%',
              },
            ]}
          />
        </View>


        {selected && (
          <View
            style={
              styles.zoom
            }
          >
            <Text
              style={
                styles.zoomText
              }
            >
              {assets.length}/3
            </Text>
          </View>
        )}
      </View>


      {/* SNAPSHOT THUMBNAILS */}

      {assets.length > 0 && (
        <ScrollView
          horizontal

          showsHorizontalScrollIndicator={
            false
          }

          contentContainerStyle={
            styles.thumbnailContent
          }

          style={
            styles.thumbnailScroll
          }
        >
          {assets.map(
            (
              image,
              index,
            ) => (
              <Pressable
                key={
                  `${image.uri}-${index}`
                }

                onPress={() => {
                  /*
                   * Move tapped snapshot
                   * to end so it becomes
                   * selected preview.
                   */
                  setAssets(
                    previous => {
                      const next =
                        [
                          ...previous,
                        ];

                      const [
                        chosen,
                      ] =
                        next.splice(
                          index,
                          1,
                        );

                      next.push(
                        chosen,
                      );

                      return next;
                    },
                  );
                }}

                onLongPress={() =>
                  removeAssetAt(
                    index,
                  )
                }

                style={
                  styles.thumbnailWrap
                }
              >
                <Image
                  source={{
                    uri:
                      image.uri,
                  }}

                  style={[
                    styles.thumbnail,

                    index ===
                      assets.length -
                        1 &&
                      styles.thumbnailSelected,
                  ]}
                />

                <View
                  style={
                    styles.thumbnailNumber
                  }
                >
                  <Text
                    style={
                      styles.thumbnailNumberText
                    }
                  >
                    {index + 1}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    removeAssetAt(
                      index,
                    )
                  }

                  style={
                    styles.thumbnailDelete
                  }
                >
                  <Icon
                    name="close"

                    size={14}

                    color="#FFFFFF"
                  />
                </Pressable>
              </Pressable>
            ),
          )}
        </ScrollView>
      )}


      {/* CAMERA CONTROLS */}

      <View
        style={styles.controls}
      >
        <Pressable
          style={
            styles.sideControl
          }

          onPress={
            openGallery
          }

          disabled={loading}
        >
          <Icon
            name="images-outline"

            size={25}

            color={
              theme.colors.text
            }
          />

          <Text
            style={
              styles.controlLabel
            }
          >
            Gallery
          </Text>
        </Pressable>


        <Pressable
          style={({ pressed }) => [
            styles.shutterOuter,

            pressed && {
              opacity: 0.7,
            },

            loading && {
              opacity: 0.4,
            },
          ]}

          onPress={
            capturePhoto
          }

          disabled={loading}
        >
          <View
            style={
              styles.shutterInner
            }
          />
        </Pressable>


        {/*
          launchCamera() opens the system
          camera interface.

          Front/back switching happens
          inside that camera UI, so we do
          NOT show a fake Flip button.
        */}

        <View
          style={
            styles.sideControl
          }
        >
          <Icon
            name="camera-outline"

            size={27}

            color={
              theme.colors
                .textSecondary
            }
          />

          <Text
            style={[
              styles.controlLabel,

              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Camera
          </Text>
        </View>
      </View>


      {/* MULTI-ANGLE INDICATORS */}

      <View
        style={styles.steps}
      >
        {[1, 2, 3].map(
          (
            step,
            index,
          ) => {
            const completed =
              assets.length >
              index;

            const active =
              assets.length ===
                index ||
              (
                assets.length ===
                  3 &&
                index === 2
              );

            return (
              <React.Fragment
                key={step}
              >
                <View
                  style={[
                    styles.step,

                    completed &&
                      styles
                        .stepCompleted,

                    active &&
                      styles
                        .stepActive,
                  ]}
                >
                  {completed ? (
                    <Icon
                      name="checkmark"

                      size={14}

                      color={
                        theme.colors
                          .background
                      }
                    />
                  ) : (
                    <Text
                      style={[
                        styles.stepText,

                        active &&
                          styles
                            .stepTextActive,
                      ]}
                    >
                      {step}
                    </Text>
                  )}
                </View>

                {step < 3 && (
                  <Text
                    style={
                      styles.stepDot
                    }
                  >
                    •
                  </Text>
                )}
              </React.Fragment>
            );
          },
        )}
      </View>


      {/* ANALYZE */}

      {assets.length > 0 && (
        <Pressable
          onPress={process}

          disabled={loading}

          style={({ pressed }) => [
            styles.continueButton,

            pressed && {
              opacity: 0.8,
            },

            loading && {
              opacity: 0.5,
            },
          ]}
        >
          <Text
            style={
              styles.continueText
            }
          >
            {loading
              ? 'ANALYZING...'
              : 'ANALYZE OBJECT'}
          </Text>

          {!loading && (
            <Icon
              name="arrow-forward"

              size={20}

              color={
                theme.colors
                  .inverseText
              }
            />
          )}
        </Pressable>
      )}


      {/* LOADING */}

      {loading && (
        <View
          style={
            styles.loadingOverlay
          }
        >
          <LoadingState
            label="Analyzing your scan..."

            size="large"
          />
        </View>
      )}
      </ScrollView>
    </AppScreen>
  );
}


/* --------------------------------------------------
   STYLES
-------------------------------------------------- */

function createStyles(
  theme: any,
  isLandscape: boolean,
) {
  return StyleSheet.create({
    screenScroll: {
      flex: 1,
    },

    screenContent: {
      flexGrow: 1,
      paddingBottom:
        isLandscape
          ? 12
          : 0,
    },

    header: {
      height:
        isLandscape
          ? 48
          : 58,

      paddingHorizontal: 18,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        theme.colors.divider,
    },


    headerTitle: {
      color:
        theme.colors.text,

      fontSize: 16,

      fontWeight: '700',
    },


    instructions: {
      alignItems: 'center',

      paddingTop:
        isLandscape
          ? 6
          : 16,

      paddingBottom:
        isLandscape
          ? 6
          : 14,
    },


    instructionTitle: {
      color:
        theme.colors.text,

      fontSize: 17,

      fontWeight: '600',
    },


    instructionSubtitle: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 12,

      marginTop: 5,
    },


    cameraFrame: {
      marginHorizontal:
        isLandscape
          ? 14
          : 18,

      height:
        isLandscape
          ? 230
          : 420,

      maxHeight:
        isLandscape
          ? 260
          : 480,

      minHeight:
        isLandscape
          ? 180
          : 280,

      overflow: 'hidden',

      borderRadius: 16,

      backgroundColor:
        theme.colors
          .surfaceVariant,
    },


    preview: {
      width: '100%',

      height: '100%',
    },


    emptyCamera: {
      flex: 1,

      alignItems: 'center',

      justifyContent:
        'center',

      padding: 32,
    },


    emptyTitle: {
      color:
        theme.colors.text,

      fontSize: 17,

      fontWeight: '600',

      marginTop: 14,
    },


    emptySubtitle: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 13,

      textAlign: 'center',

      marginTop: 6,
    },


    grid: {
      position: 'absolute',

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,
    },


    verticalGrid: {
      position: 'absolute',

      top: 0,

      bottom: 0,

      width:
        StyleSheet.hairlineWidth,

      backgroundColor:
        'rgba(255,255,255,0.28)',
    },


    horizontalGrid: {
      position: 'absolute',

      left: 0,

      right: 0,

      height:
        StyleSheet.hairlineWidth,

      backgroundColor:
        'rgba(255,255,255,0.28)',
    },


    zoom: {
      position: 'absolute',

      bottom: 12,

      alignSelf: 'center',

      backgroundColor:
        'rgba(0,0,0,0.65)',

      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 20,
    },


    zoomText: {
      color: '#FFFFFF',

      fontSize: 12,

      fontWeight: '600',
    },


    thumbnailScroll: {
      flexGrow: 0,

      marginTop: 10,
    },


    thumbnailContent: {
      paddingHorizontal: 18,

      gap: 10,
    },


    thumbnailWrap: {
      position: 'relative',
    },


    thumbnail: {
      width: 58,

      height: 58,

      borderRadius: 10,

      borderWidth: 1,

      borderColor:
        theme.colors.border,
    },


    thumbnailSelected: {
      borderWidth: 2,

      borderColor:
        theme.colors.text,
    },


    thumbnailNumber: {
      position: 'absolute',

      left: 4,

      bottom: 4,

      width: 18,

      height: 18,

      borderRadius: 9,

      backgroundColor:
        'rgba(0,0,0,0.7)',

      alignItems: 'center',

      justifyContent:
        'center',
    },


    thumbnailNumberText: {
      color: '#FFFFFF',

      fontSize: 10,

      fontWeight: '700',
    },


    thumbnailDelete: {
      position: 'absolute',

      top: -5,

      right: -5,

      width: 21,

      height: 21,

      borderRadius: 11,

      backgroundColor:
        'rgba(0,0,0,0.8)',

      alignItems: 'center',

      justifyContent:
        'center',
    },


    controls: {
      height:
        isLandscape
          ? 82
          : 102,

      paddingHorizontal:
        isLandscape
          ? 70
          : 34,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },


    sideControl: {
      width: 70,

      alignItems: 'center',

      gap: 7,
    },


    controlLabel: {
      color:
        theme.colors.text,

      fontSize: 12,

      fontWeight: '500',
    },


    shutterOuter: {
      width:
        isLandscape
          ? 62
          : 74,

      height:
        isLandscape
          ? 62
          : 74,

      borderRadius:
        isLandscape
          ? 31
          : 37,

      borderWidth: 4,

      borderColor:
        theme.colors.text,

      alignItems: 'center',

      justifyContent:
        'center',
    },


    shutterInner: {
      width:
        isLandscape
          ? 48
          : 58,

      height:
        isLandscape
          ? 48
          : 58,

      borderRadius:
        isLandscape
          ? 24
          : 29,

      backgroundColor:
        theme.colors.text,
    },


    steps: {
      height: 34,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      gap: 12,
    },


    step: {
      width: 25,

      height: 25,

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        theme.colors.border,

      alignItems: 'center',

      justifyContent:
        'center',
    },


    stepCompleted: {
      backgroundColor:
        theme.colors.text,

      borderColor:
        theme.colors.text,
    },


    stepActive: {
      borderColor:
        theme.colors.text,
    },


    stepText: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 12,

      fontWeight: '600',
    },


    stepTextActive: {
      color:
        theme.colors.text,
    },


    stepDot: {
      color:
        theme.colors
          .textSecondary,
    },


    continueButton: {
      marginHorizontal: 18,

      marginTop: 6,

      marginBottom: 12,

      minHeight: 54,

      borderRadius: 15,

      paddingHorizontal: 20,

      backgroundColor:
        theme.colors
          .inverseSurface,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },


    continueText: {
      color:
        theme.colors
          .inverseText,

      fontSize: 13,

      fontWeight: '800',

      letterSpacing: 0.3,
    },


    loadingOverlay: {
      position: 'absolute',

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,

      backgroundColor:
        theme.colors.overlay,

      justifyContent:
        'center',

      alignItems: 'center',

      zIndex: 100,
    },
  });
}