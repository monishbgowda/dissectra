/**
 * @format
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  DefaultTheme: { colors: {} },
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ component: Component }: any) => <Component navigation={{ navigate: jest.fn() }} route={{ params: undefined }} />,
  }),
}));

jest.mock('@react-three/fiber/native', () => ({ Canvas: ({ children }: any) => <>{children}</> }));
jest.mock('@react-three/drei/native', () => ({ OrbitControls: () => null, useGLTF: () => ({ scene: {} }) }));
jest.mock('react-native-fs', () => ({ DocumentDirectoryPath: '/tmp', mkdir: jest.fn(), copyFile: jest.fn(), writeFile: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(() => Promise.resolve(null)), setItem: jest.fn(() => Promise.resolve()) }));
jest.mock('react-native-image-picker', () => ({ launchCamera: jest.fn(), launchImageLibrary: jest.fn() }));

test('renders Dissectra release app correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
