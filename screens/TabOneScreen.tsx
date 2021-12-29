import {
  TextInput,
  ScrollView,
  Image,
  ImageBackground,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Appearance,
} from 'react-native';
import tw, { useDeviceContext } from 'twrnc';
import { FC, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { BlurView } from 'expo-blur';

import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import YoutubeSearchItem from '../models/YoutubeSearchItem';
import Playlist, {
  pushSongRequest,
  newPlaylist,
} from '../models/songRequest/Playlist';
import PlaylistRepository from '../services/firestore/PlaylistRepository';
import { newSongRequest } from '../models/songRequest/SongRequest';
import YoutubeSong, { newYoutubeSong } from '../models/song/YoutubeSong';
import { newUser } from '../models/user/User';
import qiqiWakaranaiImage from '../assets/images/qiqi-wakaranai.png';

const repo = new PlaylistRepository('isling');

interface MusicCardProps {
  thumbnailImage: string;
  title: string;
  channel: string;
  addSongRequest: () => void;
}

const MusicCard: FC<MusicCardProps> = (props) => {
  return (
    <Pressable onPress={props.addSongRequest}>
      <View style={tw`mx-4 my-4 h-40 rounded-3xl overflow-hidden`}>
        <ImageBackground
          source={{ uri: props.thumbnailImage }}
          blurRadius={40}
          style={tw`h-full w-full flex flex-row`}
        >
          <View
            style={tw`h-full w-32 justify-center items-center bg-transparent opacity-80`}
          >
            <Image
              source={{ uri: props.thumbnailImage }}
              style={tw`h-56 w-32`}
              resizeMode='cover'
            />
          </View>

          <View style={tw`flex-1 p-4 bg-transparent`}>
            <Text style={tw`font-semibold text-white text-lg`}>
              {props.title.slice(0, 40) +
                (props.title.length > 40 ? '...' : '')}
            </Text>
            <Text style={tw`text-gray-300`}>{props.channel}</Text>
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  );
};

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<'TabOne'>) {
  const [keyword, setKeyword] = useState<string>('');
  const [items, setItems] = useState<YoutubeSearchItem[]>([]);
  const [playlist, setPlaylist] = useState<Playlist>(newPlaylist([], 0));
  const timeout = useRef<any>(null);
  const keywordInputRef = useRef<TextInput>(null);
  const headerHeightRef = useRef<number>(-1);
  const headerHeight = useHeaderHeight();
  useDeviceContext(tw);

  const colorScheme = Appearance.getColorScheme() || 'light';

  useEffect(() => {
    if (headerHeightRef.current === -1) {
      headerHeightRef.current = headerHeight;
    }
    console.log('headerHeight: ', headerHeight);
  }, [headerHeight]);

  const handleChange = (value: string) => {
    console.log('handleChange', value);

    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(function () {
      setKeyword(value);
      timeout.current = undefined;
    }, 800);
  };
  const clearKeyword = () => setKeyword('');

  const addSongRequest = (youtubeSong: YoutubeSong) => async () => {
    const songRequest = newSongRequest(
      youtubeSong,
      newUser('isling', 'Isling')
    );
    const newPlaylist = pushSongRequest(playlist, songRequest);
    await repo.setPlaylist(newPlaylist);
  };
  const focusKeywordInput = () => {
    if (keywordInputRef.current != null) {
      keywordInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (keyword == '') return;
    console.log('search youtube: ', keyword);

    axios({
      method: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/search',
      params: {
        part: 'snippet',
        maxResults: 8,
        order: 'relevance',
        q: keyword,
        type: 'video',
        key: 'AIzaSyCxMLRCWK7yQW2eH6E9xYZdFl-M4rylTAY',
      },
    }).then((response) => {
      setItems(response.data.items);
    });
  }, [keyword]);

  useEffect(() => {
    const unsub = repo.onSnapshotPlaylist((playlist) => {
      console.log('playlist', playlist);
      if (!playlist) {
        setPlaylist(newPlaylist([], 0));
        return;
      }

      setPlaylist(playlist);
    });

    return unsub;
  }, []);

  return (
    <View style={tw`h-full`}>
      <View style={tw`flex flex-1`}>
        {items.length > 0 ? (
          <ScrollView>
            <View
              style={tw`h-[${headerHeightRef.current}px] w-full bg-transparent`}
            />
            {items.map((value) => {
              const videoData = value.snippet;
              return (
                <MusicCard
                  key={value.id.videoId}
                  title={videoData.title}
                  channel={videoData.channelTitle}
                  thumbnailImage={videoData.thumbnails.high.url}
                  addSongRequest={addSongRequest(
                    newYoutubeSong(
                      value.id.videoId,
                      videoData.title,
                      videoData.thumbnails.high.url
                    )
                  )}
                />
              );
            })}
          </ScrollView>
        ) : (
          <View style={tw`flex flex-1 h-full justify-center items-center`}>
            <Image source={qiqiWakaranaiImage} style={tw`w-36 h-36 -mt-12`} />
          </View>
        )}
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex absolute bottom-0 w-full`}
      >
        <BlurView intensity={80} tint={colorScheme} style={tw`flex px-4 py-3`}>
          <View
            style={tw`flex flex-row items-center h-12 rounded-xl bg-red-400 dark:bg-red-800 shadow `}
            onTouchStart={focusKeywordInput}
          >
            <Ionicons
              name='search-outline'
              size={20}
              style={tw`ml-3 absolute z-20 text-gray-300`}
            />
            <TextInput
              ref={keywordInputRef}
              style={tw`h-full w-full pl-9 pr-3 text-[#f1f5f9]`}
              placeholder='Search'
              onChangeText={handleChange}
              placeholderTextColor='#f1f5f9'
            />
            {/* {keyword !== '' && (
              <Pressable onPress={clearKeyword}>
                <View
                  style={tw`absolute flex items-center justify-center right-3 w-4 h-4 bg-gray-100 bg-opacity-80 rounded-full`}
                >
                  <Ionicons name='close' size={12} style={tw`text-gray-600`} />
                </View>
              </Pressable>
            )} */}
          </View>
        </BlurView>
      </KeyboardAvoidingView>
      <BlurView
        tint={colorScheme}
        intensity={80}
        style={tw`absolute w-full top-0 h-[${headerHeightRef.current}px] flex justify-end items-end pb-2 px-4`}
      >
        <View
          style={tw`flex flex-row w-full justify-between items-center bg-transparent`}
        >
          <View style={tw`flex flex-row items-center bg-transparent`}>
            <Ionicons
              name='musical-note'
              style={tw`mr-4 text-red-400 dark:text-red-800`}
              size={24}
            />
            {playlist.list
              .slice(
                Math.max(playlist.list.length - 6, 0),
                playlist.list.length
              )
              .map((item) => (
                <View
                  style={tw`flex items-center justify-center shadow rounded-full overflow-hidden h-6 w-6 -ml-4 border border-gray-300`}
                  key={item.id}
                >
                  <Image
                    source={{ uri: item.song.thumbnail }}
                    style={tw`w-8 h-8`}
                    resizeMode='cover'
                  />
                </View>
              ))}
            {playlist.list.length > 0 ? (
              <Text style={tw`ml-2 text-gray-600 dark:text-gray-200`}>
                {playlist.list.length}
              </Text>
            ) : (
              <Text style={tw`-ml-3 text-gray-600 dark:text-gray-200`}>
                add song plz
              </Text>
            )}
          </View>
          <View style={tw`flex flex-row bg-transparent`}>
            <Text
              style={tw`text-base font-semibold text-gray-600 dark:text-gray-200`}
            >
              isling
            </Text>
            <View
              style={tw`w-6 h-6 rounded-full bg-red-400 dark:bg-red-800 ml-1`}
            />
          </View>
        </View>
      </BlurView>
    </View>
  );
}
