import 'react-native-get-random-values';
import { nanoid } from 'nanoid';
import YoutubeSong from '../song/YoutubeSong';
import User from '../user/User';

interface SongRequest {
  id: string;
  song: YoutubeSong;
  user: User;
  requestTime: Date;
}

export const newSongRequest = (song: YoutubeSong, user: User): SongRequest => {
  return {
    id: nanoid(),
    song,
    user,
    requestTime: new Date(),
  };
};

export default SongRequest;
