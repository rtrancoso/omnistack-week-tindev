import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, SafeAreaView, View, Image, Text, TouchableOpacity } from 'react-native';

import api from '../services/api';

import logo from '../assets/logo.png';
import like from '../assets/like.png';
import dislike from '../assets/dislike.png';
import itsamatch from '../assets/itsamatch.png';

export default function Main({ navigation }) {
    const user = navigation.getParam('user');
    const [devs, setDevs] = useState([]);
    const [matchDev, setMatchDev] = useState(null);

    useEffect(() => {
        async function loadDevs() {
            const response = await api.get('/devs', {
                headers: { user }
            });

            setDevs(response.data);
        }

        loadDevs();
    }, [user]);

    useEffect(() => {
        const socket = io('http://localhost:3333', {
            query: { user: user }
        });

        socket.on('match', dev => {
            setMatchDev(dev);
        });
    }, [user])

    async function handleLike() {
        const [dev, ...rest] = devs;

        await api.post(`/devs/${dev._id}/likes`, null, {
            headers: { user }
        });

        setDevs(rest);
    }

    async function handleDislike() {
        const [dev, ...rest] = devs;

        await api.post(`/devs/${dev._id}/dislikes`, null, {
            headers: { user }
        });

        setDevs(rest);
    }

    async function handleLogout() {
        await AsyncStorage.clear();

        navigation.navigate('Login');
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleLogout}>
                <Image style={styles.logo} source={logo} />
            </TouchableOpacity>
            <View style={styles.cardsContainer}>
                {devs.length > 0 ? (
                    devs.map((dev, index) => (
                        <View key={dev._id} style={[styles.card, { zIndex: devs.length - index }]}>
                            <Image style={styles.avatar} source={{ uri: dev.avatar }} />
                            <View style={styles.footer}>
                                <Text style={styles.name}>{dev.name}</Text>
                                <Text style={styles.bio} numberOfLines={3}>{dev.bio}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                        <Text style={styles.empty}>Acabou :(</Text>
                    )}
            </View>
            {devs.length > 0 && (
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleDislike}>
                        <Image source={dislike} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleLike}>
                        <Image source={like} />
                    </TouchableOpacity>
                </View>
            )}

            {matchDev && (
                <View style={styles.matchContainer}>
                    <Image style={styles.matchImage} source={itsamatch} />
                    <Image style={styles.matchAvatar} source={{ uri: matchDev.avatar }} />

                    <Text style={styles.matchName}>{matchDev.name}</Text>
                    <Text style={styles.matchBio}>{matchDev.bio}</Text>

                    <TouchableOpacity onPress={() => setMatchDev(null)}>
                        <Text style={styles.closeMatch}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    logo: {
        marginTop: 30
    },

    empty: {
        alignSelf: 'center',
        color: '#999',
        fontSize: 24,
        fontWeight: 'bold'
    },

    cardsContainer: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        maxHeight: 500
    },

    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        margin: 30,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },

    avatar: {
        flex: 1,
        height: 300
    },

    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15
    },

    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },

    bio: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        lineHeight: 18
    },

    buttonsContainer: {
        flexDirection: 'row',
        marginBottom: 30
    },

    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 2,
        shadowOffset: {
            width: 0,
            height: 2
        }
    },

    matchContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    matchImage: {
        height: 60,
        resizeMode: 'contain'
    },

    matchAvatar: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 5,
        borderColor: '#fff',
        marginVertical: 30
    },

    matchName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff'
    },

    matchBio: {
        marginTop: 10,
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: 30
    },

    closeMatch: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 30,
        fontWeight: 'bold'
    }
});
