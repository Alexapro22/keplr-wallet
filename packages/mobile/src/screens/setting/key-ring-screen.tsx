import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { FullFixedPageWithoutPadding } from "../../components/page";
import { SettingBox, SettingTitle } from "../../components/setting";
import OcticonsIcon from "react-native-vector-icons/Octicons";
import FeatherIcon from "react-native-vector-icons/Feather";
import { mr2, mx2 } from "../../styles";
import { useLoadingIndicator } from "../../components/loading-indicator";

export const SetKeyRingScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const loadingIndicator = useLoadingIndicator();

  return (
    <FullFixedPageWithoutPadding>
      <SettingTitle title="Accounts" />
      {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
        return (
          <SettingBox
            key={i.toString()}
            leftIcon={<FeatherIcon name="user" style={mr2} size={18} />}
            label={`${keyStore.meta?.name ? keyStore.meta.name : "(No name)"} ${
              keyStore.selected ? "(Selected)" : ""
            }`}
            subText={keyStore.meta?.email}
            onPress={
              keyStore.selected
                ? () => undefined
                : async () => {
                    try {
                      loadingIndicator.setIsLoading("keyring", true);
                      await keyRingStore.changeKeyRing(i);
                    } catch (e) {
                      console.log(`Failed to change keyring: ${e.message}`);
                    } finally {
                      loadingIndicator.setIsLoading("keyring", false);
                    }
                  }
            }
            rightIcon={
              <OcticonsIcon name="kebab-vertical" style={mx2} size={24} />
            }
            rightIconOnPress={() => {}}
          />
        );
      })}
    </FullFixedPageWithoutPadding>
  );
});
