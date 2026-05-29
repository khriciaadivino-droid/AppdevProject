import React, { FC, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
    TextStyle,
} from 'react-native';
import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/reducers';
import { getGoogleAuthConfig } from '../../app/api/auth';
import {
    userGoogleLogin,
    userLogin,
    resetLogin,
} from '../../app/reducers/auth';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { SCREENS } from '../../utils/routes';

interface LoginScreenProps {
    navigation: any;
}

const Login: FC<LoginScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isLoading, isError, errorMessage } = useSelector(
        (state: RootState) => state.auth
    );
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isGoogleEnabled, setIsGoogleEnabled] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [googleHelperText, setGoogleHelperText] = useState<string | null>(null);

    useEffect(() => {
        console.log('🟡 Login screen mounted - resetting login state');
        dispatch(resetLogin());
    }, [dispatch]);

    useEffect(() => {
        let isMounted = true;


        const configureGoogleSignIn = async (): Promise<void> => {
            if (!isMounted) {
                return;
            }

            try {

                GoogleSignin.configure({
                    webClientId: '189109871383-06n3v0a3hamnd8rkk71u3tke1uen6r95.apps.googleusercontent.com', // Unified web client ID
                    scopes: ['email', 'profile'],
                    offlineAccess: true,
                });

                setIsGoogleEnabled(true);
                setGoogleHelperText(null);

                console.log('✅ Google Sign-In configured successfully');
            } catch (error) {
                console.log('❌ Google Sign-In configuration error:', error);

                setIsGoogleEnabled(false);
                setGoogleHelperText('Google Sign-In configuration failed.');
            }
        };

        configureGoogleSignIn();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (isError) {
            const errorMsg = errorMessage || 'Login failed. Please check your credentials.';
            Alert.alert('Login Failed', errorMsg, [
                { text: 'OK', onPress: () => dispatch(resetLogin()) },
            ]);
        }
    }, [isError, errorMessage, dispatch]);

    const validateEmail = (emailStr: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailStr);
    };

    const handleLogin = (): void => {
        console.log('🟢 Login button clicked!');

        const newErrors: { [key: string]: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        console.log('🟢 Dispatching login action...');

        dispatch(
            userLogin({
                email: email.trim(),
                password,
            })
        );
    };

    const handleGoogleSignIn = async (): Promise<void> => {
        if (!isGoogleEnabled) {
            Alert.alert('Google Sign-In unavailable', googleHelperText || 'Google Sign-In is not configured yet.');
            return;
        }

        setErrors({});
        setIsGoogleLoading(true);

        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            const result = await GoogleSignin.signIn();
            if (!isSuccessResponse(result)) {
                return;
            }

            const idToken = result.data.idToken;

            if (!idToken) {
                Alert.alert('Google Sign-In failed', 'Google did not return a valid ID token.');
                return;
            }

            dispatch(userGoogleLogin({ idToken }));
        } catch (error: any) {
            if (isErrorWithCode(error)) {
                if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                    return;
                }

                if (error.code === statusCodes.IN_PROGRESS) {
                    Alert.alert('Google Sign-In', 'A Google Sign-In request is already in progress.');
                    return;
                }

                if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    Alert.alert('Google Play Services required', 'Please update Google Play Services and try again.');
                    return;
                }
            }

            Alert.alert('Google Sign-In failed', error?.message || 'Unable to continue with Google right now.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.brandName}>PawStuff</Text>
                    <Text style={styles.brandTagline}>ONLINE PET SUPPLY SHOP</Text>
                    <Text style={styles.title}>Account Login</Text>
                    <Text style={styles.subtitle}>Welcome back! Please sign in to your account.</Text>
                </View>

                <View style={styles.form}>
                    <CustomTextInput
                        label="Email Address"
                        placeholder="Enter your email address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        containerStyle={styles.inputContainer}
                        labelStyle={styles.label}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                    <CustomTextInput
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        containerStyle={styles.inputContainer}
                        labelStyle={styles.label}
                    />
                    {errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                    )}

                    <View style={styles.rememberRow}>
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setRememberMe((v) => !v)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                {rememberMe ? <Text style={styles.checkboxTick}>✓</Text> : null}
                            </View>
                            <Text style={styles.rememberMeText}>Remember me</Text>
                        </TouchableOpacity>
                    </View>

                    <CustomButton
                        label={isLoading ? 'Signing in...' : 'Sign In'}
                        onPress={handleLogin}
                        loading={isLoading}
                        buttonStyle={styles.loginButton}
                    />

                    {isGoogleEnabled ? (
                        <>
                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.googleButton,
                                    (isLoading || isGoogleLoading) && styles.googleButtonDisabled,
                                ]}
                                onPress={handleGoogleSignIn}
                                disabled={isLoading || isGoogleLoading}
                            >
                                <View style={styles.googleButtonInner}>
                                    <View style={styles.googleIconWrapper}>
                                        <Text style={styles.googleIconB}>G</Text>
                                    </View>
                                    <Text style={styles.googleButtonText}>
                                        {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : null}

                    {googleHelperText ? (
                        <Text style={styles.googleHelperText}>{googleHelperText}</Text>
                    ) : null}
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerRegisterRow}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate(SCREENS.REGISTER)}>
                            <Text style={styles.signupLink}>Register here</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.copyright}>© 2025 PawStuff. All rights reserved.</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    header: { alignItems: 'center', marginTop: 32, marginBottom: 28 },
    brandName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1D4ED8',
        letterSpacing: 0.5,
    },
    brandTagline: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 20,
    },
    title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
    form: { marginVertical: 8 },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    errorText: { fontSize: 12, color: '#EF4444', marginTop: -12, marginBottom: 12 },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 4,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxChecked: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    checkboxTick: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        lineHeight: 14,
    },
    rememberMeText: {
        fontSize: 14,
        color: '#374151',
    },
    loginButton: { marginTop: 4 },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 16,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },
    googleButton: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingVertical: 13,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    googleButtonDisabled: {
        opacity: 0.65,
    },
    googleButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    googleIconWrapper: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIconB: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
        lineHeight: 16,
    },
    googleButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    googleHelperText: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
        marginTop: 12,
        textAlign: 'center',
    },
    footer: { alignItems: 'center', marginVertical: 28 },
    footerRegisterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    footerText: { fontSize: 14, color: '#6B7280' },
    signupLink: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
    copyright: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
});

export default Login;
