// Packages
import { useState, useEffect } from "react";

// Functions
import {
  getDiscogsOptions,
  getDiscogsItem,
  andList,
} from "@/lib/data-functions";

// Components
import Image from "next/image";
import ReactPlayer from "react-player";

// Icons
import SyncIcon from "@mui/icons-material/Sync";
import DiscogsOption from "./discogs-option";
import DiscogsItem from "./discogs-item";

export default function DiscogsPanel({ item, setItem }) {
  // State
  const [discogsOptions, setDiscogsOptions] = useState(null);

  // Constants
  const discogsItem = item?.discogsItem || null;

  // Load
  useEffect(() => {
    if (
      (item?.media === "Audio" &&
        Boolean(item?.discogsItem) &&
        Boolean(item?.artist)) ||
      Boolean(item?.title)
    )
      getDiscogsOptions(item, setDiscogsOptions);
  }, []);
  console.log(item);
  return (
    <div className="flex flex-col h-inventory">
      <div className="flex justify-between px-2">
        <Image
          src={`${process.env.NEXT_PUBLIC_RESOURCE_URL}img/discogs-logo.png`}
          alt="Discogs Logo"
          width="100px"
          height="50px"
        />
        <button
          className="icon-text-button hover:text-blue-600"
          onClick={() => {
            setItem({ ...item, discogsItem: null });
            getDiscogsOptions(item, setDiscogsOptions);
          }}
        >
          <SyncIcon /> Refresh Discogs Search
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pt-4 mx-4">
        {discogsItem ? (
          <DiscogsItem discogsItem={discogsItem} item={item} />
        ) : discogsOptions ? (
          discogsOptions.length > 0 ? (
            <div>
              {discogsOptions.map((opt: any, i: number) => (
                <DiscogsOption
                  key={i}
                  opt={opt}
                  onClick={() => {
                    getDiscogsItem(opt, item, setItem);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-xl p-6">
              No items found on Discogs...
              <br />
              Check the title and artist name.
            </div>
          )
        ) : (
          <div className="text-xl p-6">
            To search item on Discogs, fill in the title and artist on the left
            and click the button above.
          </div>
        )}
      </div>
      <div />
    </div>
  );
}
// REVIEW make discogs list more searchable
