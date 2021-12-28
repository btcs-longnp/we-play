import {
  TextInput,
  ScrollView,
  Image,
  ImageBackground,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import tw, { useDeviceContext } from 'twrnc';
import { FC, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

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
  useDeviceContext(tw);

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
        <View
          style={tw`h-24 flex justify-end items-end pb-2 px-4 shadow-md border-b border-gray-300 dark:border-gray-900 border-opacity-90`}
        >
          <View style={tw`flex flex-row`}>
            <Text
              style={tw`text-base font-semibold text-gray-600 dark:text-gray-200`}
            >
              isling
            </Text>
            <View style={tw`w-6 h-6 rounded-full bg-gray-300 ml-2`} />
          </View>
        </View>
        <ScrollView style={tw``}>
          {items.length > 0 &&
            items.map((value) => {
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw`flex`}
        >
          <View
            style={tw`flex flex-row items-center h-12 mx-4 my-3 rounded-xl bg-gray-50`}
            onTouchStart={focusKeywordInput}
          >
            <Ionicons
              name='search-outline'
              size={20}
              color='#94a3b8'
              style={tw`ml-3 absolute z-20`}
            />
            <TextInput
              ref={keywordInputRef}
              style={tw`h-full w-full pl-9 pr-3`}
              placeholder='Search'
              onChangeText={handleChange}
              placeholderTextColor='#94a3b8'
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
