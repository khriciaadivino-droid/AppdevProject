import React, { FC, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';

interface ErrorOverlayProps {
    visible?: boolean;
    message?: string;
    duration?: number;
    type?: 'error' | 'warning' | 'info' | 'success';
}

/**
 * ErrorOverlay - Toast-like error notification at bottom of screen
 * Auto-dismisses after specified duration
 */
const ErrorOverlay: FC<ErrorOverlayProps> = ({
    visible = false,
    message = '',
    duration = 3000,
    type = 'error',
}) => {
    const [show, setShow] = useState<boolean>(visible);
    const slideAnim = React.useRef(new Animated.Value(100)).current;

    useEffect(() => {
        if (visible && message) {
            setShow(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            const timer = setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue: 100,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => setShow(false));
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, message, duration, slideAnim]);

    if (!show) return null;

    const getBackgroundColor = (): string => {
        switch (type) {
            case 'error':
                return '#FEE2E2';
            case 'warning':
                return '#FEF3C7';
            case 'success':
                return '#DCFCE7';
            case 'info':
                return '#DBEAFE';
            default:
                return '#FEE2E2';
        }
    };

    const getTextColor = (): string => {
        switch (type) {
            case 'error':
                return '#7F1D1D';
            case 'warning':
                return '#92400E';
            case 'success':
                return '#15803D';
            case 'info':
                return '#0C2340';
            default:
                return '#7F1D1D';
        }
    };

    const getIcon = (): string => {
        switch (type) {
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            case 'info':
                return 'ℹ️';
            default:
                return '❌';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Text style={[styles.icon]}>{getIcon()}</Text>
            <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 999,
    },
    icon: { fontSize: 18, marginRight: 8 },
    message: { fontSize: 14, fontWeight: '500', flex: 1 },
});

export default ErrorOverlay;
