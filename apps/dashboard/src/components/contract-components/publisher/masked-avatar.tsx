"use client";

import { useThirdwebClient } from "@/constants/thirdweb.client";
import { resolveScheme } from "thirdweb/storage";
import {
  MaskedAvatar,
  type MaskedAvatarProps,
} from "tw-components/masked-avatar";
import { useEns, usePublisherProfile } from "../hooks";

interface PublisherAvatarProps extends Omit<MaskedAvatarProps, "src"> {
  address: string;
}

export const PublisherAvatar: React.FC<PublisherAvatarProps> = ({
  address,
  isPending,
  ...restProps
}) => {
  const client = useThirdwebClient();
  const ensQuery = useEns(address);
  const publisherProfile = usePublisherProfile(
    ensQuery.data?.address || undefined,
  );
  return (
    <MaskedAvatar
      isPending={isPending || ensQuery.isPending || publisherProfile.isPending}
      src={
        publisherProfile.data?.avatar
          ? resolveScheme({
              uri: publisherProfile.data.avatar,
              client,
            })
          : ""
      }
      {...restProps}
    />
  );
};
