import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Octicons, Entypo } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function ImageViews() {
    const params = useLocalSearchParams();
    const [hasPermission, setHasPermission] = useState(null);
    const [status, setStatus] = useState('');
    const [imageSize, setImageSize] = useState({ width: wp(92), height: wp(92) });
    const [localUri, setLocalUri] = useState('');
    const router = useRouter();

    const uri = params.image;

    useEffect(() => {
        // Request permission to access media library
        const requestPermissions = async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        requestPermissions();
    }, []);

    useEffect(() => {
        if (uri) {
            // Download the image to local storage
            const downloadImage = async () => {
                try {
                    const fileExtension = uri.split('.').pop(); // Get file extension
                    const localUri = `${FileSystem.documentDirectory}image.${fileExtension}`;
                    const { uri: downloadedUri } = await FileSystem.downloadAsync(uri, localUri);
                    setLocalUri(downloadedUri);
                } catch (error) {
                    console.log('Error downloading image:', error);
                }
            };
            downloadImage();
        }
    }, [uri]);

    useEffect(() => {
        if (uri) {
            // Get image size and set the aspect ratio
            let getSize = (uri, (width, height) => {
                const aspectRatio = width / height;
                const maxWidth = Platform.OS === 'web' ? wp(50) : wp(92);
                const calculatedHeight = maxWidth / aspectRatio;

                setImageSize({ width: maxWidth, height: calculatedHeight });
            });
        }
    }, [uri]);

    const handleDownloadImage = async () => {
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'You need to grant storage permission to download the image.');
            return;
        }

        setStatus('downloading');

        try {
            if (localUri) {
                const asset = await MediaLibrary.createAssetAsync(localUri);
                const album = await MediaLibrary.createAlbumAsync('Poetry', asset, false);
                if (album) {
                    Alert.alert('Success', 'Image downloaded and saved to album');
                } else {
                    Alert.alert('Save Error', 'Failed to save image to album.');
                }
            } else {
                Alert.alert('Download Failed', 'Image download failed');
            }
        } catch (error) {
            console.log('Error saving to album:', error.message);
            Alert.alert('Save Error', 'Failed to save image to album.');
        } finally {
            setStatus('');
        }
    };

    const handleShareImage = async () => {
        setStatus('sharing');

        try {
            if (localUri) {
                await Sharing.shareAsync(localUri);
                Alert.alert('Success', 'Image shared successfully');
            } else {
                Alert.alert('Share Failed', 'Image share failed');
            }
        } catch (error) {
            console.log('Error sharing image:', error.message);
            Alert.alert('Share Error', 'Failed to share image.');
        } finally {
            setStatus('');
        }
    };

    if (!uri) {
        return (
            <View style={styles.container}>
                <Text>No image data</Text>
            </View>
        );
    }

    return (
        <BlurView intensity={30} tint='dark' style={styles.container}>
            <View style={[styles.imageContainer, imageSize]}>
                <Image source={{ uri }} style={[styles.image, imageSize]} />
            </View>
            <View style={styles.buttons}>
                <Animated.View entering={FadeInDown.springify()}>
                    <Pressable style={styles.button} onPress={() => router.back()}>
                        <Octicons name='x' size={24} color='white' />
                    </Pressable>
                </Animated.View>
                <Animated.View entering={FadeInDown.springify().delay(100)}>
                    <Pressable style={styles.button} onPress={handleDownloadImage}>
                        <Octicons name='download' size={24} color='white' />
                    </Pressable>
                </Animated.View>
                <Animated.View entering={FadeInDown.springify().delay(200)}>
                    <Pressable style={styles.button} onPress={handleShareImage}>
                        <Entypo name='share' size={24} color='white' />
                    </Pressable>
                </Animated.View>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        // resizeMode: 'contain',  
    },
    buttons: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    button: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 50,
        marginHorizontal: 10,
    },
});
