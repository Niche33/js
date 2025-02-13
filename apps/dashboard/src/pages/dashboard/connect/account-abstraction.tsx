import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrackedLinkTW } from "@/components/ui/tracked-link";
import {
  AccountStatus,
  type ApiKey,
  useAccount,
  useApiKeys,
} from "@3rdweb-sdk/react/hooks/useApi";
import { useLoggedInUser } from "@3rdweb-sdk/react/hooks/useLoggedInUser";
import { AppLayout } from "components/app-layouts/app";
import { SmartWalletsBillingAlert } from "components/settings/ApiKeys/Alerts";
import { ApiKeysMenu } from "components/settings/ApiKeys/Menu";
import { NoApiKeys } from "components/settings/ApiKeys/NoApiKeys";
import { ConnectSDKCard } from "components/shared/ConnectSDKCard";
import { SmartWallets } from "components/smart-wallets";
import { getAbsoluteUrl } from "lib/vercel-utils";
import { CircleAlertIcon } from "lucide-react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { PageId } from "page-id";
import { useMemo, useState } from "react";
import { useActiveWalletChain } from "thirdweb/react";
import type { ThirdwebNextPage } from "utils/types";
import { ConnectSidebarLayout } from "../../../app/(dashboard)/dashboard/connect/DashboardConnectLayout";
import { isOpChainId } from "../../../app/team/[team_slug]/[project_slug]/connect/account-abstraction/isOpChain";

const TRACKING_CATEGORY = "smart-wallet";

export type SmartWalletFormData = {
  chainAndFactoryAddress: string;
  clientId: string;
};

const DashboardConnectAccountAbstraction: ThirdwebNextPage = () => {
  const router = useRouter();
  const defaultClientId = router.query.clientId?.toString();
  const looggedInUserQuery = useLoggedInUser();
  const keysQuery = useApiKeys();
  const [selectedKey_, setSelectedKey] = useState<undefined | ApiKey>();
  const meQuery = useAccount();
  const account = meQuery?.data;
  const chain = useActiveWalletChain();

  const apiKeys = useMemo(() => {
    return (keysQuery?.data || []).filter((key) => {
      return !!(key.services || []).find((srv) => srv.name === "bundler");
    });
  }, [keysQuery]);

  const hasApiKeys = apiKeys.length > 0;

  // compute the actual selected key based on if there is a state, if there is a query param, or otherwise the first one
  const selectedKey = useMemo(() => {
    if (selectedKey_) {
      return selectedKey_;
    }
    if (apiKeys.length) {
      if (defaultClientId) {
        return apiKeys.find((k) => k.key === defaultClientId);
      }
      return apiKeys[0];
    }
    return undefined;
  }, [apiKeys, defaultClientId, selectedKey_]);

  const hasSmartWalletsWithoutBilling = useMemo(() => {
    if (!account || !apiKeys) {
      return;
    }

    return apiKeys.find((k) =>
      k.services?.find(
        (s) =>
          account.status !== AccountStatus.ValidPayment && s.name === "bundler",
      ),
    );
  }, [apiKeys, account]);

  const isOpChain = chain?.id ? isOpChainId(chain.id) : false;

  const seo = {
    title: "The Complete Account Abstraction Toolkit | thirdweb",
    desc: "Add account abstraction to your web3 app & unlock powerful features for seamless onboarding, customizable transactions, & maximum security. Get started.",
  };

  const isPending = looggedInUserQuery.isPending || keysQuery.isPending;

  return (
    <div className="flex flex-col gap-10">
      <NextSeo
        title={seo.title}
        description={seo.desc}
        openGraph={{
          title: seo.title,
          description: seo.desc,
          images: [
            {
              url: `${getAbsoluteUrl()}/assets/og-image/dashboard-wallets-smart-wallet.png`,
              width: 1200,
              height: 630,
              alt: seo.title,
            },
          ],
        }}
      />

      <div className="flex flex-col content-start justify-between gap-4 lg:flex-row">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-semibold text-2xl tracking-tight lg:text-3xl">
            Account Abstraction
          </h1>

          <p className="text-muted-foreground text-sm">
            Easily integrate Account abstraction (ERC-4337) compliant smart
            accounts into your apps.{" "}
            <TrackedLinkTW
              target="_blank"
              label="docs-wallets"
              category={TRACKING_CATEGORY}
              href="https://portal.thirdweb.com/wallets/smart-wallet"
              className="text-link-foreground hover:text-foreground"
            >
              View Documentation
            </TrackedLinkTW>
          </p>
        </div>

        {hasApiKeys && (
          <div>
            {selectedKey && (
              <ApiKeysMenu
                apiKeys={apiKeys}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
              />
            )}
          </div>
        )}
      </div>

      {isPending ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-border">
          <Spinner className="size-14" />
        </div>
      ) : (
        <>
          {hasSmartWalletsWithoutBilling ? (
            <SmartWalletsBillingAlert />
          ) : (
            isOpChain && (
              <Alert variant="info">
                <CircleAlertIcon className="size-4" />
                <AlertTitle>
                  Using the gas credits for OP chain paymaster
                </AlertTitle>
                <AlertDescription>
                  Credits will automatically be applied to cover gas fees for
                  any onchain activity across thirdweb services. <br />
                  Eligible chains: OP Mainnet, Base, Zora, Frax, Mode.
                </AlertDescription>
              </Alert>
            )
          )}

          {!hasApiKeys && <NoApiKeys service="Account Abstraction" />}

          {hasApiKeys && selectedKey && (
            <SmartWallets
              apiKeyServices={selectedKey.services || []}
              trackingCategory={TRACKING_CATEGORY}
            />
          )}
        </>
      )}

      <ConnectSDKCard
        title="Get Started"
        description="Add account abstraction to your app with the Connect SDK."
      />
    </div>
  );
};

DashboardConnectAccountAbstraction.getLayout = (page, props) => (
  <AppLayout
    {...props}
    pageContainerClassName="!max-w-full !px-0"
    mainClassName="!pt-0"
  >
    <ConnectSidebarLayout>{page}</ConnectSidebarLayout>
  </AppLayout>
);

DashboardConnectAccountAbstraction.pageId =
  PageId.DashboardConnectAccountAbstraction;

export default DashboardConnectAccountAbstraction;
