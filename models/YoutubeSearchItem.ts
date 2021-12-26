interface YoutubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

export default YoutubeSearchItem;
