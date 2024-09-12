import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Carousel from 'leon-react-native-snap-carousel';
import { data } from '@/constants/data';
import { Image } from 'expo-image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/color';
import { useRouter } from 'expo-router';


const { width: screenWidth } = Dimensions.get('window');
const sliderWidth = screenWidth; 
const itemWidth = 325;   

const gradients=colors;

export default function Home() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);


    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={()=> router.push({ pathname: 'imageViews', params: { image: item } })}>
            <View style={styles.slide} key={index}>
                <Image source={item} style={styles.image} />
            </View>
            </TouchableOpacity>
        );
    };
   

    const handleSnapToItem = (index) => {
        setActiveIndex(index);
    };

    return (
     
            <LinearGradient
            colors={gradients[activeIndex % gradients.length]} // Gradient colors similar to the image
             style={styles.gradient}
            >
                <Text style={styles.title}>My Poetry</Text>
            <Carousel
                data={data}
                renderItem={renderItem}
                sliderWidth={sliderWidth}
                itemWidth={itemWidth}
                inactiveSlideScale={0.95}  
                inactiveSlideOpacity={0.7}  
                onSnapToItem={handleSnapToItem}
            />
       

            </LinearGradient>
   
    );
}

const styles = StyleSheet.create({

    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        padding: 20,
    },
    slide: {
        borderRadius: 8,
        height: hp('70%'),
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width:wp('90%'),
        height:hp('60%'),
        borderRadius: 6,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});