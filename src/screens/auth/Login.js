import { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { SvgXml } from 'react-native-svg';

import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin, resetLogin, userLoginCompleted } from '../../app/reducers/auth';
import { googleLogin } from '../../app/api/auth';
import { SCREENS } from '../../utils/routes';
import IMAGES from '../../utils/image';

const Login = () => {
  const navigation = useNavigation();
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleSignInReady, setGoogleSignInReady] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);

  const googleSvg = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.17H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.83v-2.85h3.85z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  `;

  const dispatch = useDispatch();
  const { isLoading, isError, errorMessage } = useSelector(state => state.auth);

  // Initialize GoogleSignin once on mount
  useEffect(() => {
    console.log('🟡 Login screen mounted - resetting login state');
    dispatch(resetLogin());

    const initGoogleSignIn = async () => {
      try {
        await GoogleSignin.configure({
          webClientId: '189109871383-06n3v0a3hamnd8rkk71u3tke1uen6r95.apps.googleusercontent.com',
          offlineAccess: false,
          forceCodeForRefreshToken: false,
        });
        console.log('🟢 GoogleSignin configured successfully');
        setGoogleSignInReady(true);
      } catch (error) {
        console.error('🔴 GoogleSignin config error:', error);
        setGoogleSignInReady(true); // Still allow trying (Firebase might handle it)
      }
    };

    initGoogleSignIn();
  }, [dispatch]);

  // Handle error state
  useEffect(() => {
    if (isError) {
      const errorMsg = errorMessage || 'Login failed. Please check your credentials.';

      // Check if it's an account not found error
      if (errorMsg.toLowerCase().includes('not found') ||
        errorMsg.toLowerCase().includes('invalid') ||
        errorMsg.toLowerCase().includes('401')) {
        Alert.alert(
          'Account Not Found',
          'This account is not registered. Please register first or check your email and password.',
          [
            { text: 'Register', onPress: () => navigation.navigate(SCREENS.REGISTER) },
            { text: 'Try Again', onPress: () => dispatch(resetLogin()), style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Login Failed',
          errorMsg,
          [{ text: 'OK', onPress: () => dispatch(resetLogin()) }]
        );
      }
    }
  }, [dispatch, errorMessage, isError, navigation]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    console.log('🟢 Login button clicked!');
    console.log('🟢 Current loading state:', isLoading);
    console.log('🟢 Email:', emailAdd, 'Password:', password);

    const newErrors = {};

    // Validate email
    if (!emailAdd.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(emailAdd)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('🔴 Validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }

    setErrors({});

    console.log('🟢 Dispatching login action...');
    // Dispatch Redux action to login diri mo set ka data
    dispatch(
      userLogin({
        email: emailAdd,
        password: password,
      })
    );
    console.log('🟢 Login action dispatched!');
  };

  const handleGoogleLogin = async () => {
    if (googleSigningIn) {
      console.log('🟡 Google sign-in already in progress, ignoring tap');
      return;
    }

    if (!googleSignInReady) {
      Alert.alert('Not Ready', 'Google Sign-In is still initializing. Please try again in a moment.');
      return;
    }

    // Prevent multiple simultaneous sign-in attempts
    setGoogleSigningIn(true);

    try {
      console.log('🟡 Starting Google Sign-In process...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.log('🟡 Google sign-out skipped:', signOutError?.message || signOutError);
      }

      const signInResult = await GoogleSignin.signIn();
      if (signInResult?.type && signInResult.type !== 'success') {
        console.log('🔴 Google Sign-In cancelled or failed');
        return;
      }

      console.log('🟢 Google Sign-In successful, getting tokens...');
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens?.accessToken;

      if (!accessToken) {
        throw new Error('Google Sign-In did not return an access token.');
      }

      // Sign in with Firebase to get Firebase token
      console.log('🟡 Signing in with Firebase...');
      const googleCredential = auth.GoogleAuthProvider.credential(null, accessToken);
      const firebaseAuthResult = await auth().signInWithCredential(googleCredential);
      const firebaseUser = firebaseAuthResult?.user;

      if (!firebaseUser?.uid || !firebaseUser?.email) {
        throw new Error('Firebase Auth did not return a valid user profile.');
      }

      console.log('🟢 Firebase sign-in successful:', firebaseUser.email);
      const firebaseToken = await firebaseUser.getIdToken();

      // Now authenticate with our backend
      console.log('🟡 Authenticating with backend...');
      dispatch({ type: 'USER_LOGIN_REQUEST' });

      try {
        const backendResponse = await googleLogin({
          firebaseToken,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          googleId: firebaseUser.uid,
        });

        console.log('🟢 Backend authentication successful');
        dispatch(
          userLoginCompleted({
            id: backendResponse.id,
            email: backendResponse.email,
            name: backendResponse.name,
            token: backendResponse.token,
            loginTime: new Date().toISOString(),
            authProvider: 'google',
            photoURL: backendResponse.photoURL,
          })
        );
      } catch (backendError) {
        console.error('🔴 Backend authentication failed:', backendError.message);
        if (backendError.message.includes('already exists')) {
          Alert.alert(
            'Email Conflict',
            backendError.message,
            [{ text: 'OK', onPress: () => { } }]
          );
        } else {
          Alert.alert(
            'Backend Authentication Failed',
            backendError.message || 'Could not complete Google login. Please ensure the API server is running.',
            [{ text: 'OK', onPress: () => { } }]
          );
        }
      }
    } catch (error) {
      console.error('🔴 Google login error:', error);
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google Sign-In');
        return;
      }

      if (error?.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in already in progress, please wait...');
        Alert.alert('Google Sign-In', 'A sign-in request is already in progress. Please wait a moment and try again.');
        return;
      }

      if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services', 'Google Play Services is not available on this device.');
        return;
      }

      if (error?.message?.includes('DEVELOPER_ERROR')) {
        Alert.alert(
          'Google Sign-In Not Configured',
          'Firebase still does not have a matching Android OAuth client for this debug build. Add the debug SHA-1 (5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25) in Firebase, enable Google sign-in, then download a fresh google-services.json.'
        );
        return;
      }

      Alert.alert('Google Sign-In Failed', error?.message || 'Unable to sign in with Google.');
    } finally {
      setGoogleSigningIn(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {IMAGES.LOGO && (
            <View style={styles.logoContainer}>
              <Image
                source={IMAGES.LOGO}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>PawStuff</Text>
              <Text style={styles.brandTagline}>ONLINE PET SUPPLY SHOP</Text>
            </View>
          )}

          <Text style={styles.title}>Account Login</Text>
          <Text style={styles.subtitle}>Welcome back! Please sign in to your account.</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <CustomTextInput
              placeholder={'admin@pawstuff.com'}
              value={emailAdd}
              onChangeText={(val) => {
                setEmailAdd(val);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              containerStyle={styles.input}
              textStyle={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <CustomTextInput
              placeholder={'Enter your password'}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              containerStyle={styles.input}
              textStyle={styles.textInput}
              secureTextEntry={true}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>

          <CustomButton
            label={'Sign In'}
            onPress={handleLogin}
            buttonStyle={styles.loginButton}
            loading={isLoading}
          />

          <TouchableOpacity
            style={[styles.googleButton, !googleSignInReady && styles.googleButtonDisabled]}
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
            disabled={googleSigningIn || !googleSignInReady}
          >
            {googleSigningIn ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <SvgXml xml={googleSvg} width={20} height={20} />
            )}
            <Text style={styles.googleButtonText}>
              {googleSigningIn ? 'Connecting...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.REGISTER)}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>© 2025 PawStuff. All rights reserved.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f5fa3',
    marginTop: 6,
  },
  brandTagline: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#6b7280',
    marginTop: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 22,
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'left',
  },
  textInput: {
    fontSize: 14,
    color: '#111827',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 13,
    marginTop: 5,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#2b63e3',
    borderColor: '#2b63e3',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#374151',
  },
  loginButton: {
    marginTop: 5,
    marginBottom: 12,
    width: '100%',
    borderRadius: 10,
  },
  googleButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  googleButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    width: '100%',
  },
  registerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#2b63e3',
    fontWeight: '600',
  },
  copyright: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
  },
});

export default Login;