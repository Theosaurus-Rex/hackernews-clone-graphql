import React from "react";
import { AUTH_TOKEN } from "../constants";
import { timeDifferenceForDate } from "../utils";

const Link = (props) => {
  const { link } = props;
  const authToken = localStorage.getItem(AUTH_TOKEN);

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        {/* Only allow votes from users who are logged in*/}
        {authToken && (
          <div
            className="ml1 gray f11"
            style={{ cursor: "pointer" }}
            onClick={() => {
              console.log("Clicked vote button");
            }}
          >
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description} ({link.url})
        </div>
        {
          <div className="f6 lh-copy gray">
            {link.votes.length} votes | by{" "}
            {/* Default to "unknown" for links posted by users who are not authenticated */}
            {link.postedBy ? link.postedBy.name : "Unknown"}{" "}
            {/* Convert time stamp to a user-friendly string */}
            {timeDifferenceForDate(link.createdAt)}
          </div>
        }
      </div>
    </div>
  );
};

export default Link;
