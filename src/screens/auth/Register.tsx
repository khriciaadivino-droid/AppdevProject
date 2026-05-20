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
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/reducers';
import {
    userRegister,
    resetRegister,
} from '../../app/reducers/auth';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { SCREENS } from '../../utils/routes';

interface RegisterScreenProps {
    navigation: any;
}

const Register: FC<RegisterScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const {
        isRegistering,
        isRegisterError,
        registerErrorMessage,
        registerSuccess,
    } = useSelector((state: RootState) => state.auth);

    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        dispatch(resetRegister());
    }, [dispatch]);

    useEffect(() => {
        if (isRegisterError) {
            const errorMsg = registerErrorMessage || 'Registration failed. Please try again.';
            Alert.alert('Registration Failed', errorMsg, [
                { text: 'OK', onPress: () => dispatch(resetRegister()) },
            ]);
        }
    }, [isRegisterError, registerErrorMessage, dispatch]);

    useEffect(() => {
        if (registerSuccess && !isRegistering && !isRegisterError) {
            setFullName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            Alert.alert(
                'Registration Successful',
                'Your account has been created. You can now sign in.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            dispatch(resetRegister());
                            navigation.navigate(SCREENS.LOGIN);
                        },
                    },
                ]
            );
        }
    }, [registerSuccess, isRegistering, isRegisterError, dispatch, navigation]);

    const validateEmail = (emailStr: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailStr);
    };

    const handleRegister = (): void => {
        const newErrors: { [key: string]: string } = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

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

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        dispatch(
            userRegister({
                email: email.trim(),
                password,
                firstName: fullName.trim(),
            })
        );
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join PawStuff today and manage your pets.</Text>
                </View>

                <View style={styles.form}>
                    <CustomTextInput
                        label="Full Name"
                        placeholder="John Doe"
                        value={fullName}
                        onChangeText={setFullName}
                        containerStyle={styles.inputContainer}
                        labelStyle={styles.label}
                    />
                    {errors.fullName && (
                        <Text style={styles.errorText}>{errors.fullName}</Text>
                    )}

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

                    <CustomTextInput
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        containerStyle={styles.inputContainer}
                        labelStyle={styles.label}
                    />
                    {errors.confirmPassword && (
                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}

                    <View style={styles.termsContainer}>
                        <Text style={styles.termsText}>
                            By creating an account, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </View>

                    <CustomButton
                        label={isRegistering ? 'Creating Account...' : 'Create Account'}
                        onPress={handleRegister}
                        loading={isRegistering}
                        buttonStyle={styles.registerButton}
                    />
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate(SCREENS.LOGIN)}>
                            <Text style={styles.signinLink}>Sign in</Text>
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
    header: { alignItems: 'center', marginTop: 32, marginBottom: 20 },
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
    termsContainer: { marginBottom: 24, paddingHorizontal: 4 },
    termsText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
    termsLink: { color: '#2563EB', fontWeight: '600' },
    registerButton: { marginTop: 4 },
    footer: { alignItems: 'center', marginVertical: 28 },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    footerText: { fontSize: 14, color: '#6B7280' },
    signinLink: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
    copyright: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
});

export default Register;
