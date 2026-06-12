import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FloatingToolbar = memo(({
    visible = false,
    onBookmark = () => { },
    onShare = () => { },
    onTafsir = () => { },
    onNotes = () => { },
    onClose = () => { }
}) => {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.toolbar}>
                <TouchableOpacity style={styles.iconButton} onPress={onBookmark}>
                    <Ionicons name="bookmark-outline" size={24} color="#F4FFD4" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={onShare}>
                    <Ionicons name="share-social-outline" size={24} color="#F4FFD4" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={onTafsir}>
                    <Ionicons name="book-outline" size={24} color="#F4FFD4" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={onNotes}>
                    <Ionicons name="create-outline" size={24} color="#F4FFD4" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={20} color="#F4FFD4" />
                </TouchableOpacity>
            </View>
        </View>
    );
});

FloatingToolbar.propTypes = {
    visible: PropTypes.bool,
    onBookmark: PropTypes.func,
    onShare: PropTypes.func,
    onTafsir: PropTypes.func,
    onNotes: PropTypes.func,
    onClose: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 110, // Floating above audio player
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 1000,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(81, 175, 91, 0.98)', // Islamic green
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    iconButton: {
        paddingHorizontal: 15,
    },
    closeButton: {
        paddingHorizontal: 12,
        marginLeft: 5,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(244, 255, 212, 0.3)',
    },
});

export default FloatingToolbar;
