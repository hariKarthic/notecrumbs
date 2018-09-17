/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, Button } from "react-native";
import BackgroundGeolocation from "react-native-background-geolocation";

const geolocation = navigator.geolocation;

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { text: "React Native - Geofencing Tests" };
    geolocation.setRNConfiguration({
      skipPermissionRequests: true
    });

    this.onDropNote = this.onDropNote.bind(this);
    this.addNoteToFence = this.addNoteToFence.bind(this);
  }
  // You must remove listeners when your component unmounts
  componentWillUnmount() {
    BackgroundGeolocation.removeListeners();
  }
  onLocation(location) {
    console.log("- [event] location is changing: ", location.coords);
  }
  onError(error) {
    console.warn("- [event] location error ", error);
  }
  onActivityChange(activity) {
    console.log("- [event] activitychange: ", activity); // eg: 'on_foot', 'still', 'in_vehicle'
  }
  onProviderChange(provider) {
    console.log("- [event] providerchange: ", provider);
  }
  onMotionChange(location) {
    console.log("- [event] motionchange: ", location.isMoving, location);
  }
  componentWillMount() {
    console.log("Component Gonna Mount.. Batter up!!!");
    ////
    // 1.  Wire up event-listeners
    //

    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.on("location", this.onLocation, this.onError);

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.on("motionchange", this.onMotionChange);

    // This event fires when a change in motion activity is detected
    BackgroundGeolocation.on("activitychange", this.onActivityChange);

    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.on("providerchange", this.onProviderChange);

    ////
    // 2.  Execute #ready method (required)
    //
    BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: 0,
      distanceFilter: 5,
      // Activity Recognition
      stopTimeout: 1,
      stopOnStationary: true,
      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true, // <-- Auto start tracking when device is powered-up.
      // HTTP / SQLite config
      reset: true,
      batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: true // <-- [Default: true] Set true to sync each location to server as it arrives.
    }).then(state => {
      console.log(
        "- BackgroundGeolocation is configured and ready: ",
        state.enabled
      );
      if (!state.enabled) {
        ////
        // 3. Start tracking!
        //
        BackgroundGeolocation.start(function () {
          console.log("- Start success");
        });
      }
    });
  }
  onDropNote(e) {
    const that = this;
    geolocation.getCurrentPosition(
      location => {
        console.log("Dropping Note at");
        console.log(location.coords);
        that.addNoteToFence(location.coords);
      },
      error => {
        console.log("Error while fetching current location");
        console.error(error);
      },
      { samples: 1, persist: false }
    );
  }

  addNoteToFence(coords) {
    console.log("Adding fences");
    const config = {
      identifier: "hari",
      radius: 100,
      latitude: coords.latitude,
      longitude: coords.longitude,
      notifyOnEntry: true,
      notifyOnExit: false,
      notifyOnDwell: false
    };
    BackgroundGeolocation.addGeofence(
      config,
      () => {
        console.log("Geofence successfully added");
      },
      err => {
        console.warn("Geofence not added", error);
      }
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={{ fontWeight: "bold" }}>{this.state.text}</Text>
        <Button
          onPress={this.onDropNote}
          title="Get Location"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
