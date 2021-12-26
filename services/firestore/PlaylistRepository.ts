import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  CollectionReference,
  collection,
  getFirestore,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import Playlist, { commitPlaylist } from '../../models/songRequest/Playlist';

export type SnapshotPlaylistHandler = (playlist?: Playlist) => void;

class PlaylistRepository {
  baseURL: string;
  audience: string;
  playlistCollection: CollectionReference;

  constructor(audience: string) {
    this.baseURL = 'rezik';
    this.audience = audience;
    this.playlistCollection = collection(
      doc(collection(getFirestore(), this.baseURL), this.audience),
      'playlists'
    );
  }

  onSnapshotPlaylist(handler: SnapshotPlaylistHandler): Unsubscribe {
    const unsub = onSnapshot(doc(this.playlistCollection, 'default'), (doc) => {
      handler(doc.data() as Playlist | undefined);
    });

    return unsub;
  }

  async setPlaylist(playlist: Playlist) {
    console.log('setPlaylist', playlist);
    const docSnap = await getDoc(doc(this.playlistCollection, 'default'));
    if (docSnap.exists()) {
      if (docSnap.data().version !== playlist.version) {
        console.log(
          `setPlaylist: can not update: data on server has updated. Server: ver${
            docSnap.data().version
          }, Client: ver${playlist.version}`
        );
        return;
      }
    }

    return setDoc(
      doc(this.playlistCollection, 'default'),
      commitPlaylist(playlist)
    );
  }

  async removePlaylist() {
    return deleteDoc(doc(this.playlistCollection, 'default'));
  }
}

export default PlaylistRepository;
