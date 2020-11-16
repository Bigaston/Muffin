import React, { useEffect, useState } from "react";

import { useQuery, useLazyQuery, gql } from "@apollo/client";

const GET_PODCAST_ITEM = gql`
  query episode($guid: String!) {
    podcastItem(_id: $guid) {
      _id
      title
      url
      ... on Episode {
        enclosure {
          duration
          url
          cover {
            medium_url
          }
        }
      }
      podcast {
        _id
        title
        website_url
      }
    }
  }
`;

const GET_PODCAST_ITEMS = gql`
  query podcast($podcast_id: String!) {
    podcast(_id: $podcast_id) {
      items {
        _id
        title
        url
        ... on Episode {
          enclosure {
            duration
            url
            cover {
              medium_url
            }
          }
        }
      }
    }
  }
`;

const podcloudItemToPlayerItem = (ep) => ({
  ...ep,
  enclosure_url: ep.enclosure?.url,
  enclosure_duration: ep.enclosure?.duration,
  cover: ep.enclosure?.cover,
});

const PodcloudLoader = ({ guid, PlayerComponent }) => {
  console.log("guid");

  const [currentEpisode, setCurrentEpisode] = useState();
  const [currentPodcast, setCurrentPodcast] = useState();

  const episode = useQuery(GET_PODCAST_ITEM, {
    variables: { guid },
  });

  const [loadPodcastEpisodes, podcastEpisodes] = useLazyQuery(
    GET_PODCAST_ITEMS,
    {
      variables: { podcast_id: currentPodcast?._id },
    }
  );

  useEffect(() => {
    const ep = episode?.data?.podcastItem;
    if (ep?._id) {
      console.log("setCurrentEpisode");
      setCurrentEpisode(podcloudItemToPlayerItem(ep));
      setCurrentPodcast({
        ...ep.podcast,
        url: ep.podcast?.website_url,
      });
    }
  }, [episode?.data, setCurrentEpisode, setCurrentPodcast]);

  useEffect(() => {
    if (currentPodcast?._id) {
      console.log("loading episodes list");
      loadPodcastEpisodes();
    }
  }, [currentPodcast?._id, loadPodcastEpisodes]);

  console.log("rendering loader");
  console.log("currentEpisode", currentEpisode);

  const episodesList = podcastEpisodes?.loading
    ? { loading: true }
    : Array.isArray(podcastEpisodes?.data?.podcast?.items)
    ? podcastEpisodes.data.podcast.items.map(podcloudItemToPlayerItem)
    : [];

  console.log({ podcastEpisodes, episodesList });

  if (podcastEpisodes?.error) {
    console.error(podcastEpisodes.error, podcastEpisodes);
  }

  const loading =
    episode.loading || !currentEpisode?._id || !currentPodcast._id;

  return episode.error ? (
    <pre>{JSON.stringify(episode.error, null, 3)}</pre>
  ) : loading ? (
    <>Loading...</>
  ) : (
    <PlayerComponent
      currentEpisode={currentEpisode}
      currentPodcast={currentPodcast}
      episodesList={episodesList}
      setCurrentEpisode={setCurrentEpisode}
    />
  );
};

export default PodcloudLoader;
