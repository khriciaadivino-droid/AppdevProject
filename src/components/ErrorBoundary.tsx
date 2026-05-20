import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
    onReset?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: { componentStack: string } | null;
}

/**
 * ErrorBoundary - Catches uncaught JavaScript errors in child components
 * Displays error UI instead of white screen crash
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
        console.error('🔴 ErrorBoundary caught error:', error);
        console.error('🔴 Error Info:', errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    resetError = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, backgroundColor: '#FEE2E2', justifyContent: 'center', padding: 16 }}>
                    {/* Header */}
                    <View style={{ width: '100%', marginBottom: 24 }}>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#7F1D1D', marginBottom: 8 }}>
                            ⚠️ Something went wrong
                        </Text>
                        <Text style={{ fontSize: 16, color: '#B91C1C' }}>
                            The app encountered an unexpected error
                        </Text>
                    </View>

                    {/* Error Message */}
                    <ScrollView
                        style={{
                            width: '100%',
                            backgroundColor: '#FCA5A5',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 24,
                            maxHeight: 160,
                        }}
                        scrollEnabled
                    >
                        <Text style={{ fontSize: 12, color: '#7F1D1D', fontFamily: 'monospace' }}>
                            {this.state.error?.toString()}
                        </Text>
                        {__DEV__ && this.state.errorInfo && (
                            <Text style={{ fontSize: 10, color: '#991B1B', marginTop: 16, fontFamily: 'monospace' }}>
                                {this.state.errorInfo.componentStack}
                            </Text>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    <TouchableOpacity
                        onPress={this.resetError}
                        style={{
                            backgroundColor: '#DC2626',
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                            marginBottom: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => console.log('🟡 Error logged for debugging')}
                        style={{
                            backgroundColor: '#F3F4F6',
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderRadius: 6,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                        }}
                    >
                        <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600' }}>View Details</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
