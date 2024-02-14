import React, { FunctionComponent } from "react";
import {
  IFeeConfig,
  IGasConfig,
  InsufficientFeeError,
} from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { XAxis, YAxis } from "../../../../components/axis";
import { Subtitle3, Subtitle4 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { Gutter } from "../../../../components/gutter";
import { VerticalResizeTransition } from "../../../../components/transition";
import { useIntl } from "react-intl";

export const FeeSummary: FunctionComponent<{
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
}> = observer(({ feeConfig, gasConfig }) => {
  const { priceStore, chainStore } = useStore();

  const intl = useIntl();

  const theme = useTheme();

  return (
    <Box>
      <Box
        padding="1rem"
        borderRadius="0.375rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-600"]
        }
      >
        <XAxis alignY="center">
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["gray-200"]
            }
          >
            Fee Options
          </Subtitle3>

          <div style={{ flex: 1 }} />

          <YAxis>
            {(() => {
              if (feeConfig.fees.length > 0) {
                return feeConfig.fees;
              }
              const chainInfo = chainStore.getChain(feeConfig.chainId);
              return [
                new CoinPretty(
                  chainInfo.stakeCurrency || chainInfo.currencies[0],
                  new Dec(0)
                ),
              ];
            })()
              .map((fee) =>
                fee
                  .maxDecimals(6)
                  .inequalitySymbol(true)
                  .trim(true)
                  .shrink(true)
                  .hideIBCMetadata(true)
                  .toString()
              )
              .map((text) => {
                return (
                  <Subtitle3
                    key={text}
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-600"]
                        : ColorPalette["gray-50"]
                    }
                  >
                    {text}
                  </Subtitle3>
                );
              })}
          </YAxis>

          <Gutter size="0.25rem" />
          <Subtitle3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-300"]
            }
          >
            {(() => {
              let total: PricePretty | undefined;
              let hasUnknown = false;
              for (const fee of feeConfig.fees) {
                if (!fee.currency.coinGeckoId) {
                  hasUnknown = true;
                  break;
                } else {
                  const price = priceStore.calculatePrice(fee);
                  if (price) {
                    if (!total) {
                      total = price;
                    } else {
                      total = total.add(price);
                    }
                  }
                }
              }

              if (hasUnknown || !total) {
                return "(-)";
              }
              return `(${total.toString()})`;
            })()}
          </Subtitle3>
        </XAxis>
      </Box>

      <VerticalResizeTransition transitionAlign="top">
        {feeConfig.uiProperties.error || feeConfig.uiProperties.warning ? (
          <Box
            marginTop="0.75rem"
            borderRadius="0.5rem"
            alignX="center"
            alignY="center"
            paddingY="1.125rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["orange-50"]
                : ColorPalette["yellow-800"]
            }
          >
            <Subtitle4
              color={
                theme.mode === "light"
                  ? ColorPalette["orange-400"]
                  : ColorPalette["yellow-400"]
              }
            >
              {(() => {
                if (feeConfig.uiProperties.error) {
                  if (
                    feeConfig.uiProperties.error instanceof InsufficientFeeError
                  ) {
                    return intl.formatMessage({
                      id: "components.input.fee-control.error.insufficient-fee",
                    });
                  }

                  return (
                    feeConfig.uiProperties.error.message ||
                    feeConfig.uiProperties.error.toString()
                  );
                }

                if (feeConfig.uiProperties.warning) {
                  return (
                    feeConfig.uiProperties.warning.message ||
                    feeConfig.uiProperties.warning.toString()
                  );
                }

                if (gasConfig.uiProperties.error) {
                  return (
                    gasConfig.uiProperties.error.message ||
                    gasConfig.uiProperties.error.toString()
                  );
                }

                if (gasConfig.uiProperties.warning) {
                  return (
                    gasConfig.uiProperties.warning.message ||
                    gasConfig.uiProperties.warning.toString()
                  );
                }
              })()}
            </Subtitle4>
          </Box>
        ) : null}
      </VerticalResizeTransition>
    </Box>
  );
});
