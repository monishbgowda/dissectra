if(NOT TARGET react-native-nitro-image::NitroImage)
add_library(react-native-nitro-image::NitroImage SHARED IMPORTED)
set_target_properties(react-native-nitro-image::NitroImage PROPERTIES
    IMPORTED_LOCATION "E:/dissectra/node_modules/react-native-nitro-image/android/build/intermediates/cxx/RelWithDebInfo/4o3y594o/obj/x86_64/libNitroImage.so"
    INTERFACE_INCLUDE_DIRECTORIES "E:/dissectra/node_modules/react-native-nitro-image/android/build/headers/nitroimage"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

