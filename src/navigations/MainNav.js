import { createStackNavigator } from '@react-navigation/stack';
import { SCREENS } from '../utils/routes';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={SCREENS.HOME}>
      <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
