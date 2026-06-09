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

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/logos/headset.png'),
    title: 'Novos universos',
    description: 'Descubra novos jogos e monte sua coleção pessoal',
    buttonText: 'Próximo',
  },
  {
    id: '2',
    image: require('../assets/logos/mic.png'),
    title: 'Veja o que a galera tá jogando',
    description: 'Acompanhe o progresso dos seus amigos e descubra novos jogos.',
    buttonText: 'Próximo',
  },
  {
    id: '3',
    image: require('../assets/logos/monitor.png'),
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
        <Image source={require('../assets/logos/Logo.png')} style={styles.splashLogo} />
        <Text style={styles.splashTitle}>Playdex</Text>
        <Text style={styles.splashSubtitle}>Descubra, jogue, conecte</Text>
      </View>
    );
  }

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
        style={styles.flatList} // Adicionado estilo na lista
        contentContainerStyle={styles.flatListContent} // Garante o crescimento interno na Web
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
    height: '100%', // Força altura total na Web
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
  flatList: {
    flex: 1, // Força a lista a esticar e ocupar o espaço do container
  },
  flatListContent: {
    flexGrow: 1,
  },
  slide: {
    width: width,
    height: '100%', // Mudado de estável para '100%' para acompanhar a FlatList na Web
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
    width: 180,
    height: 180,
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
    backgroundColor: '#5012FF', 
    width: 180,
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