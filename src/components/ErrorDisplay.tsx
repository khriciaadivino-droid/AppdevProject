import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    ViewStyle,
    TextStyle,
    StyleSheet,
} from 'react-native';
import { RootState } from '../app/reducers';
import { clearError } from '../app/reducers/error';

interface ErrorDisplayProps {
    visible?: boolean;
    onDismiss?: () => void;
}

interface ErrorColorTheme {
    bg: string;
    border: string;
    text: string;
}

/**
 * ErrorDisplay - Shows detailed error information in a modal
 * Displays validation errors, messages, and retry options
 */
const ErrorDisplay: FC<ErrorDisplayProps> = ({ visible, onDismiss }) => {
    const dispatch = useDispatch();
    const error = useSelector((state: RootState) => state.error);
    const [autoHide, setAutoHide] = useState<boolean>(false);

    useEffect(() => {
        if (error?.statusCode && [401, 403, 422].includes(error.statusCode)) {
            setAutoHide(false);
        } else if (error?.statusCode === 0) {
            setAutoHide(true);
            const timer = setTimeout(() => {
                handleDismiss();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleDismiss = (): void => {
        dispatch(clearError());
        if (onDismiss) onDismiss();
    };

    const getErrorColor = (statusCode: number | undefined): ErrorColorTheme => {
        if (statusCode === 401) return { bg: '#FED7AA', border: '#F97316', text: '#92400E' };
        if (statusCode === 403) return { bg: '#FCA5A5', border: '#EF4444', text: '#7F1D1D' };
        if (statusCode === 422) return { bg: '#FEF08A', border: '#EABC15', text: '#713F12' };
        if (statusCode === 0) return { bg: '#BFDBFE', border: '#3B82F6', text: '#1E3A8A' };
        return { bg: '#FCA5A5', border: '#EF4444', text: '#7F1D1D' };
    };

    const getErrorIcon = (statusCode: number | undefined): string => {
        if (statusCode === 401) return '🔐';
        if (statusCode === 403) return '🚫';
        if (statusCode === 422) return '✅';
        if (statusCode === 0) return '📡';
        return '❌';
    };

    const getErrorTitle = (statusCode: number | undefined): string => {
        if (statusCode === 401) return 'Session Expired';
        if (statusCode === 403) return 'Access Denied';
        if (statusCode === 422) return 'Validation Error';
        if (statusCode === 0) return 'Network Error';
        return 'Error';
    };

    if (!error?.message) {
        return null;
    }

    const colors = getErrorColor(error.statusCode);
    const icon = getErrorIcon(error.statusCode);
    const title = getErrorTitle(error.statusCode);

    return (
        <Modal
            visible={visible !== false && !!error?.message}
            transparent
            animationType="slide"
            onRequestClose={handleDismiss}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.errorContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <View style={styles.header}>
                        <Text style={styles.icon}>{icon}</Text>
                        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    </View>

                    <ScrollView style={styles.messageScroll}>
                        <Text style={[styles.message, { color: colors.text }]}>
                            {error.message}
                        </Text>

                        {error.details && (
                            <Text style={[styles.details, { color: colors.text }]}>
                                {JSON.stringify(error.details, null, 2)}
                            </Text>
                        )}

                        {error.fieldErrors && Object.keys(error.fieldErrors).length > 0 && (
                            <View style={styles.fieldErrorsSection}>
                                <Text style={[styles.fieldErrorsTitle, { color: colors.text }]}>
                                    Field Errors:
                                </Text>
                                {Object.entries(error.fieldErrors).map(([field, errorMsg]) => (
                                    <Text key={field} style={[styles.fieldError, { color: colors.text }]}>
                                        • {field}: {String(errorMsg)}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {error.isRetryable && (
                        <TouchableOpacity
                            onPress={handleDismiss}
                            style={[styles.retryButton, { backgroundColor: colors.border }]}
                        >
                            <Text style={styles.retryButtonText}>🔄 Retry</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
                        <Text style={[styles.dismissButtonText, { color: colors.text }]}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    errorContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderTopWidth: 2,
        padding: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: { fontSize: 32, marginRight: 12 },
    title: { fontSize: 18, fontWeight: '700' },
    messageScroll: { maxHeight: 200, marginBottom: 16 },
    message: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
    details: { fontSize: 12, fontFamily: 'monospace', marginBottom: 8, opacity: 0.7 },
    fieldErrorsSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
    fieldErrorsTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    fieldError: { fontSize: 12, marginBottom: 4 },
    retryButton: { paddingVertical: 12, borderRadius: 6, marginBottom: 8, alignItems: 'center' },
    retryButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    dismissButton: { paddingVertical: 12, alignItems: 'center', opacity: 0.7 },
    dismissButtonText: { fontSize: 14, fontWeight: '600' },
});

export default ErrorDisplay;
