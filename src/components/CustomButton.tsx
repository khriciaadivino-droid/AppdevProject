import React, { FC } from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
} from 'react-native';

interface CustomButtonProps {
    label: string;
    onPress: () => void;
    buttonStyle?: ViewStyle;
    loading?: boolean;
    disabled?: boolean;
}

const CustomButton: FC<CustomButtonProps> = ({
    label,
    onPress,
    buttonStyle,
    loading = false,
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, buttonStyle, (loading || disabled) && styles.buttonDisabled]}
            activeOpacity={0.8}
            disabled={loading || disabled}
        >
            {loading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <Text style={styles.buttonText}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        shadowColor: '#2563eb',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomButton;
