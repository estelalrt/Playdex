import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView 
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('./assets/headset.png'), 
    title: 'Novos universos',
    description: 'Descubra novos jogos e monte sua coleção pessoal',
    buttonText: 'Próximo',
  },
  {
    id: '2',
    image: require('./assets/mic.png'),
    title: 'Veja o que a galera tá jogando',
    description: 'Acompanhe o progresso dos seus amigos e descubra novos jogos.',
    buttonText: 'Próximo',
  },
  {
    id: '3',
    image: require('./assets/monitor.png'),
    title: 'Pronto pra jogar?',
    description: '', 
    buttonText: 'Começar',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      if (onFinish) onFinish();
    }
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/logo-controle.png')} style={styles.splashLogo} />
        <Text style={styles.splashTitle}>Playdex</Text>
        <Text style={styles.splashSubtitle}>Descubra, jogue, conecte</Text>
      </View>
    );
  }

  // Renderização de cada Card do Onboarding
  const renderSlide = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{item.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const contentOffsetX = e.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffsetX / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  splashTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  splashSubtitle: {
    color: '#A0A0A0',
    fontSize: 16,
    marginTop: 10,
  },
  slide: {
    width: width,
    height: height,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width: width * 0.45,
    height: width * 0.45,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    color: '#A0A0A0',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#5616FF', 
    width: width * 0.45,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});