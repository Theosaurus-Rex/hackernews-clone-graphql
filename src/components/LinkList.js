import React from "react";
import Link from "./Link";
import { useQuery, gql } from "@apollo/client";
import { LINKS_PER_PAGE } from "../constants";
import { useLocation, useNavigate } from "react-router-dom";

// Accepts arguments used for pagination and ordering
export const FEED_QUERY = gql`
  query FeedQuery($take: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(take: $take, skip: $skip, orderBy: $orderBy) {
      id
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`;

// Listen for any newly created links
const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

const LinkList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isNewPage = location.pathname.includes("new");
  const pageIndexParams = location.pathname.split("/");
  const page = parseInt(pageIndexParams[pageIndexParams.length - 1]);
  const pageIndex = page ? (page - 1) * LINKS_PER_PAGE : 0;

  // The getQueryVariables function is responsible for returning values for skip, take, and orderBy. For skip, we first check whether we are currently on the /new route. If so, the value for skip is the current page (subtracting 1 to handle the index) multiplied by the LINKS_PER_PAGE constant. If we’re not on the /new route, the value for skip is 0. We use the same LINKS_PER_PAGE constant to determine how many links to take.

  const getQueryVariables = (isNewPage, page) => {
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const take = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = { createdAt: "desc" };
    return { take, skip, orderBy };
  };

  const { data, loading, error, subscribeToMore } = useQuery(FEED_QUERY, {
    variables: getQueryVariables(isNewPage, page),
  });

  const getLinksToRender = (isNewPage, data) => {
    if (isNewPage) {
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  // subscribeToMore takes an object that defines how to listen for and respond to a subscription
  subscribeToMore({
    document: NEW_LINKS_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev;
      const newLink = subscriptionData.data.newLink;
      const exists = prev.feed.links.find(({ id }) => id === newLink.id);
      if (exists) return prev;

      return (
        <>
          {loading && <p>Loading...</p>}
          {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
          {data && (
            <>
              {getLinksToRender(isNewPage, data).map((link, index) => (
                <Link key={link.id} link={link} index={index + pageIndex} />
              ))}
              {isNewPage && (
                <div className="flex ml4 mv3 gray">
                  <div
                    className="pointer mr2"
                    onClick={() => {
                      if (page > 1) {
                        navigate(`/new/${page - 1}`);
                      }
                    }}
                  >
                    Previous
                  </div>
                  <div
                    className="pointer"
                    onClick={() => {
                      if (page <= data.feed.count / LINKS_PER_PAGE) {
                        const nextPage = page + 1;
                        navigate(`/new/${nextPage}`);
                      }
                    }}
                  >
                    Next
                  </div>
                </div>
              )}
            </>
          )}
        </>
      );
    },
  });
  subscribeToMore({
    document: NEW_VOTES_SUBSCRIPTION,
  });
  return (
    <div>
      {data && (
        <>
          {data.feed.links.map((link, index) => (
            <Link key={link.id} link={link} index={index} />
          ))}
        </>
      )}
    </div>
  );
};

export default LinkList;
