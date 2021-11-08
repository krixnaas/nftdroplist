//import liraries
import React, { useState, useEffect } from "react";
import contract from "../contract/contract.json";
import Web3 from "web3";

import { useForm } from "react-hook-form";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "../styles/styles.css";

const initialInfo = {
  connected: true,
  status: null,
  account: null,
  contract: null,
};

const initDropsState = {
  loading: false,
  list: [],
};

const DropList = () => {
  const [info, setInfo] = useState(initialInfo);
  const [drops, setDrops] = useState(initDropsState);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const init = async () => {
    if (window.ethereum?.isMetaMask) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const networkId = await window.ethereum.request({
        method: "net_version",
      });
      if (networkId == 4) {
        let web3 = new Web3(window.ethereum);
        setInfo({
          ...initialInfo,
          account: accounts[0],
          contract: new web3.eth.Contract(contract.abi, contract.address),
        });
      } else {
        setInfo({
          ...initialInfo,
          status: "You need be on the Ethereum Testnet.",
        });
      }
    } else {
      setInfo({ ...initialInfo, status: "You need metamask" });
    }
  };

  const initOnChanged = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  };

  const getDrops = async () => {
    setDrops((prevState) => ({
      ...prevState,
      loading: true,
    }));
    info.contract.methods
      .getDrops()
      .call()
      .then((res) => {
        setDrops({
          loading: false,
          list: res,
        });
      })
      .catch((err) => {
        console.log(err);
        setDrops(initDropsState);
      });
  };

  useEffect(() => {
    init();
    initOnChanged();
  }, []);

  const onSubmit = (data) => {
    let newData = {
      imageUri: data.imageUri,
      name: data.name,
      description: data.description,
      website: data.website,
      social_1: data.social_1,
      social_2: data.social_2,
      price: data.price,
      supply: Number(data.supply),
      presale: Number(data.presale),
      sale: Number(data.sale),
      chain: Number(data.chain),
      approved: false,
    };
    info.contract.methods
      .addDrop(Object.values(newData))
      .send({ from: info.account })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
        <div className={"header"}>
            <h3>NFT Drop Hunter</h3>
        </div>
        <div className={"content"}>
      <Tabs>
        <TabList>
          <Tab>Title 1</Tab>
          <Tab>Title 2</Tab>
        </TabList>

        <TabPanel>
          <button onClick={() => getDrops()}>Get Drops</button>
          {drops.loading ? <p>Loading</p> : null}
          {drops.list.map((item) => {
            return (
              <div>
                <img
                  alt={"drop image"}
                  src={item.imageUri}
                  style={{ width: 40, height: 40 }}
                />
                <p>Name: {item.name}</p>
                <p>Description: {item.description}</p>
                <p>Supply: {item.supply}</p>
                <p>Sale: {item.sale}</p>
                <p>Presale: {item.presale}</p>
                <p>Social_1: {item.social_1}</p>
                <p>Social_2: {item.social_2}</p>
              </div>
            );
          })}
        </TabPanel>
        <TabPanel>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label>imageUri</label>
            <input {...register("imageUri")} />
            <br />
            <label>name</label>
            <input {...register("name")} />
            <br />
            <label>description</label>
            <input {...register("description")} />
            <br />
            <label>twitter</label>
            <input {...register("social_1")} />
            <br />
            <label>discord</label>
            <input {...register("social_2")} />
            <br />
            <label>website</label>
            <input {...register("website")} />
            <br />
            <label>price</label>
            <input {...register("price")} />
            <br />
            <label>supply</label>
            <input {...register("supply")} />
            <br />
            <label>presale</label>
            <input {...register("presale")} />
            <br />
            <label>sale</label>
            <input {...register("sale")} />
            <br />
            <label>chain</label>
            <input {...register("chain")} />
            <br />
            <input type="submit" />
          </form>
        </TabPanel>
      </Tabs>
      </div>

    </div>
  );
};

export default DropList;
