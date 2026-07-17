if(NOT TARGET react-native-nitro-modules::NitroModules)
add_library(react-native-nitro-modules::NitroModules SHARED IMPORTED)
set_target_properties(react-native-nitro-modules::NitroModules PROPERTIES
    IMPORTED_LOCATION "E:/dissectra/node_modules/react-native-nitro-modules/android/build/intermediates/cxx/RelWithDebInfo/5y2t2j4f/obj/x86_64/libNitroModules.so"
    INTERFACE_INCLUDE_DIRECTORIES "E:/dissectra/node_modules/react-native-nitro-modules/android/build/headers/nitromodules"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

