import axios from "axios";
import React from "react";
import Router from "next/router";
import useSWR from "swr";

import checkLogin from "../../lib/utils/checkLogin";
import { SERVER_BASE_URL } from "../../lib/utils/constant";
import storage from "../../lib/utils/storage";

const FAVORITED_CLASS = "btn btn-sm btn-primary";
const NOT_FAVORITED_CLASS = "btn btn-sm btn-outline-primary";

const FavoriteArticleButton = (props) => {
  const { data: currentUser } = useSWR("user", storage);
  const isLoggedIn = checkLogin(currentUser);
  const [favorited, setFavorited] = React.useState(props.favorited);
  const [favoritesCount, setFavoritesCount] = React.useState(props.favoritesCount);
  React.useEffect(() => {
    setFavorited(props.favorited);
    setFavoritesCount(props.favoritesCount);
  }, [props.favorited, props.favoritesCount])
  let buttonText;
  if (props.showText) {
    if (favorited) {
      buttonText = 'Unfavorite'
    } else {
      buttonText = 'Favorite'
    }
    buttonText += ' Article'
  } else {
    buttonText = ''
  }
  const handleClickFavorite = async () => {
    if (!isLoggedIn) {
      Router.push(`/user/login`);
      return;
    }
    setFavorited(!favorited)
    setFavoritesCount(favoritesCount + (favorited ? - 1 : 1))
    try {
      if (favorited) {
        await axios.delete(`${SERVER_BASE_URL}/articles/${props.slug}/favorite`, {
          headers: {
            Authorization: `Token ${currentUser?.token}`,
          },
        });
      } else {
        await axios.post(
          `${SERVER_BASE_URL}/articles/${props.slug}/favorite`,
          {},
          {
            headers: {
              Authorization: `Token ${currentUser?.token}`,
            },
          }
        );
      }
    } catch (error) {
      setFavorited(!favorited)
      setFavoritesCount(favoritesCount + (favorited ? 1 : -1))
    }
  };
  return (
    <button
      className={
        favorited ? FAVORITED_CLASS : NOT_FAVORITED_CLASS
      }
      onClick={() => handleClickFavorite()}
    >
      <i className="ion-heart" />{props.showText ? ' ' : ''}{buttonText} <span className="counter">
        {props.showText ? '(' : ''}{favoritesCount}{props.showText ? ')' : ''}
      </span>
    </button>
  )
}

export default FavoriteArticleButton;
