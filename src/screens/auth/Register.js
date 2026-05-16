import { useState } from 'react';
import { Alert, StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { authRegister } from '../../app/api/auth';
import { SCREENS } from '../../utils/routes';
import IMAGES from '../../utils/image';

const Register = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    const newErrors = {};

    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

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

    // Validate confirm password
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
    setIsLoading(true);

    try {
      await authRegister({
        name: fullName.trim(),
        email: emailAdd.trim(),
        password: password,
      });

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please sign in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(SCREENS.LOGIN),
          },
        ]
      );
    } catch (error) {
      const message = error?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setIsLoading(false);
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
            </View>
          )}

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PawStuff today!</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <CustomTextInput
              placeholder={'John Doe'}
              value={fullName}
              onChangeText={(val) => {
                setFullName(val);
                if (errors.fullName) setErrors({ ...errors, fullName: null });
              }}
              containerStyle={styles.input}
              textStyle={styles.textInput}
              autoCapitalize="words"
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <CustomTextInput
              placeholder={'you@example.com'}
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
              placeholder={'At least 6 characters'}
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
            {!errors.password && <Text style={styles.hintText}>Minimum 6 characters</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <CustomTextInput
              placeholder={'Re-enter your password'}
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
              }}
              containerStyle={styles.input}
              textStyle={styles.textInput}
              secureTextEntry={true}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <CustomButton
            label={'Create Account'}
            onPress={handleRegister}
            buttonStyle={styles.registerButton}
            loading={isLoading}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.LOGIN)}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>© 2026 Divino. All rights reserved.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeafe',
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 48,
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
    marginBottom: 20,
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  input: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'left',
  },
  textInput: {
    fontSize: 15,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 13,
    marginTop: 5,
  },
  hintText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 5,
  },
  registerButton: {
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    width: '100%',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
  },
});

export default Register;
