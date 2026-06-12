import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import strings from '../locales/i18nStrings';
import { Ionicons } from '@expo/vector-icons';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the error, and displays a fallback UI instead of crashing.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRestart = () => {
        // Reset the error state to try rendering again
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            return (
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="warning-outline" size={80} color="#FF6B6B" />
                    </View>
                    <Text style={styles.title}>{strings.ERROR_BOUNDARY_TITLE}</Text>
                    <Text style={styles.message}>
                        {strings.ERROR_BOUNDARY_MESSAGE}
                    </Text>
                    {__DEV__ && this.state.error && (
                        <View style={styles.errorDetails}>
                            <Text style={styles.errorText}>
                                {this.state.error.toString()}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                        <Ionicons name="refresh" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>{strings.ERROR_BOUNDARY_TRY_AGAIN}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 30,
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    errorDetails: {
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        maxWidth: '100%',
    },
    errorText: {
        fontSize: 12,
        color: '#FF6B6B',
        fontFamily: 'monospace',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#50CC42',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default ErrorBoundary;
