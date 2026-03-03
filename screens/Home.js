import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');

    return (
        <ScrollView style={styles.container}> 
            <View style={styles.header}> 
                <Image source={require('../assets/logos/Logo.png')} 
                style={styles.logo} /> 
                
                <View style={styles.searchContainer}> 
                    <TextInput style={styles.searchInput} 
                        placeholder="Buscar..." 
                        placeholderTextColor="#6F6F6F" 
                        value={search} onChangeText={setSearch} /> 

                    <Image source={require('../assets/icons/search.png')} 
                    style={styles.searchIcon} /> 
                </View> 
            </View>

            <Text style={styles.sectionTitle}>
                Atividade de amigos
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                style={styles.scrollWrapper}
            >
                <View style={styles.gameCard}>
                    <Image
                        source={require('../assets/games/stardew.png')}
                        style={styles.game}
                    />
                    <View style={styles.activityInfo}>
                        <Image
                        source={require('../assets/icons/duda.png')}
                        style={styles.player}
                        />
                        <Text style={styles.playerName}>
                            duds
                        </Text>
                         <Image
                        source={require('../assets/icons/playing.png')}
                        style={styles.playing}
                        />
                    </View>
                </View>
                <View>
                    <Image
                        source={require('../assets/games/cuphead.png')}
                        style={styles.game}
                    />
                    <View style={styles.activityInfo}>
                            <Image
                            source={require('../assets/icons/gab.jpg')}
                            style={styles.player}
                            />
                            <Text style={styles.playerName}>
                                gabriel
                            </Text>
                            <Image
                            source={require('../assets/icons/check.png')}
                            style={styles.check}
                            />
                    </View>
                </View>
                <View>
                    <Image
                        source={require('../assets/games/death.png')}
                        style={styles.game}
                    />
                    <View style={styles.activityInfo}>
                            <Image
                            source={require('../assets/icons/andrey.png')}
                            style={styles.player}
                            />
                            <Text style={styles.playerName}>
                                andrey
                            </Text>
                            <Image
                            source={require('../assets/icons/check.png')}
                            style={styles.check}
                            />
                    </View>
                </View>
                    
                

            </ScrollView>
            <Text style={styles.sectionTitle}>
                Populares agora
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                style={styles.scrollWrapper}
            >

                <Image
                    source={require('../assets/games/expedition.png')}
                    style={styles.game}
                />

                <Image
                    source={require('../assets/games/blueprince.png')}
                    style={styles.game}
                />

                <Image
                    source={require('../assets/games/helldivers.png')}
                    style={styles.game}
                />

                <Image
                    source={require('../assets/games/silksong.png')}
                    style={styles.game}
                />

            </ScrollView>

            <Text style={styles.sectionTitle}>
                Sugestões para você
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                style={styles.scrollWrapper}
            >

                <Image
                    source={require('../assets/games/woods.png')}
                    style={styles.game}
                />

                <Image
                    source={require('../assets/games/hozy.png')}
                    style={styles.game}
                />

                <Image
                    source={require('../assets/games/whisper.png')}
                    style={styles.game}
                />

                <Image
                    source={require('../assets/games/assemble.png')}
                    style={styles.game}
                />

            </ScrollView>

        </ScrollView>
    );
}


const styles = StyleSheet.create({

    container: { 
        flex: 1, 
        backgroundColor: '#000000', 
        paddingTop: 20, 
        paddingHorizontal: 24, 
    }, 
    
    logo: { 
        width: 53.86, 
        height: 40, 
        resizeMode: 'contain', 
    }, 
    
    searchContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#1C1C1C', 
        borderRadius: 40, 
        height: 50, 
        paddingHorizontal: 16,
        flex: 1, 
        marginLeft: 15, 
    },

    searchInput: { 
        flex: 1, 
        color: '#FFFFFF', 
        fontSize: 16, 
    },
    
    searchInput: { 
        flex: 1, 
        color: '#FFFFFF', 
        fontSize: 16, 
        width: 200, 
    }, 
    
    header: { 
        width: '100%', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginTop: 60, 
    },

    sectionTitle: {
        color: '#FFFFFF',
        marginTop: 32,
        fontSize: 18,
        fontWeight: '500',
    },

    scrollContainer: {
        paddingTop: 20,
    },

    game: {
        width: 100,
        height: 135,
        marginRight: 12,
        borderRadius: 10,
    },

    player: {
        width: 26,
        height: 26,
        marginRight: 6,
        borderRadius: 13, 
        resizeMode: 'cover',
    },

    playing: {
        tintColor: '#ffffff',
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },

    check: {
        tintColor: '#00BEBE',
        width: 16,
        height: 16,
        resizeMode: 'contain',
    },

    activityInfo: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center', 
    },

    playerName: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        marginRight: 6,
    },


    scrollWrapper: {
        marginRight: -24, 
    },

    scrollContainer: {
        paddingTop: 20,
        paddingRight: 24, 
    },

});
