import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export const getAllTitles = async () => {
  const querySnapshot = await getDocs(collection(db, "articles"));
  return querySnapshot.docs.map((doc) => doc.data().title);
};
