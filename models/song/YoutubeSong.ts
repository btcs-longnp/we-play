interface YoutubeSong {
  id: string;
  title: string;
  thumbnail: string;
}

export const newYoutubeSong = (
  id: string,
  title: string,
  thumbnail: string
): YoutubeSong => {
  let song: YoutubeSong = {
    id,
    title,
    thumbnail,
  };

  return song;
};

export default YoutubeSong;
