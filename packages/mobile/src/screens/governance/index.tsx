/* eslint-disable react/display-name */
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Page } from "../../components/page";
import { createStackNavigator } from "@react-navigation/stack";
import { AllProposals } from "./all-proposals";
import { GovernanceDetailsScreeen } from "./governance-details-screeen";
import { GradientBackground } from "../../components/svg";

const GovernaceStack = createStackNavigator();

export const GovernanceStackScreen: FunctionComponent = () => {
  return (
    <GovernaceStack.Navigator
      screenOptions={{
        headerBackground: () => <GradientBackground />,
        headerBackTitleVisible: false,
      }}
    >
      <GovernaceStack.Screen name="Governance" component={GovernanceScreen} />
      <GovernaceStack.Screen
        name="Governance Details"
        component={GovernanceDetailsScreeen}
      />
    </GovernaceStack.Navigator>
  );
};

const GovernanceScreen: FunctionComponent = observer(() => {
  return (
    <Page>
      <AllProposals />
    </Page>
  );
});
