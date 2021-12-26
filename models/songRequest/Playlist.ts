import SongRequest from './SongRequest';

interface Playlist {
  list: SongRequest[];
  version: number;
}

export const newPlaylist = (list: SongRequest[], version: number): Playlist => {
  return {
    list,
    version,
  };
};

export const pushSongRequest = (
  playlist: Playlist,
  songRequest: SongRequest
): Playlist => {
  return {
    ...playlist,
    list: [...playlist.list, songRequest],
  };
};

export const commitPlaylist = (playlist: Playlist): Playlist => {
  return {
    ...playlist,
    version: playlist.version + 1,
  };
};

export default Playlist;
