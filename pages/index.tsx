import { GetStaticProps } from "next";
import React from "react";
import styles from "../styles/Home.module.scss";
import type { HomeData, PageProps } from "../../utils/types";

const Home = (props: PageProps & AboutData) => {
  return <div>hello world</div>;
};

export const getStaticProps: GetStaticProps = async () => {
  // const [commonData, aboutData] = await Promise.all([
  //   getCommonData(),
  //   getAboutData(),
  // ]);
  return { props: {} };
};

export default Home;
