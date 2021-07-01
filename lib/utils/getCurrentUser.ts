import useSWR from "swr";

import checkLogin from "lib/utils/checkLogin";
import storage from "lib/utils/storage";

export default function getCurrentUser() {
    const { data: currentUser } = useSWR("user", storage);
    const isLoggedIn = checkLogin(currentUser);
    if (isLoggedIn) {
      return currentUser;
    } else {
      return undefined;
    }
}
