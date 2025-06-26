import React from 'react';

const Info = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flexStart',
      }}
    >
      <br></br>A demo version of the flight planning tool that FORCE is
      developing for use during research campaigns. Feedback and bug reports are
      welcomed and encouraged, please send them to laurents.marker@ncas.ac.uk.
      <br></br>
      <h5>Time and Vertical Level</h5>
      The scroll bars at the bottom and right hand side of the map define the
      current time and vertical level of the system. Waypoints added will
      inherit the selected values in their metadata.
      <br></br>
      <h5>Waypoints</h5>
      <p>
        Waypoints can be added by either clicking the map or by manually adding
        using the plus button in the waypoints menu. A waypoint can be edited by
        opening it&apos;s sub menu and changing it&apos;s metadata. It can be
        duplicated or deleted here too.
      </p>
      <p>
        The visual styling of waypoint is sensitive to both the current time and
        vertical level of the map. They will be black, blue or white if they are
        prior to, contemporary with or following the current time. An arrow will
        appear above or below the waypoint if it&apos;s vertical level with
        respect to the ground is higher or lower than the current vertical
        level.
      </p>
      <br></br>
      <h5>Trajectories</h5>
      <p>
        Trajectories are added manually from the Trajectories menu. By opening a
        trajectory sub menu, the name of the trajectory can be edited, waypoints
        can be added and removed and a list of waypoints currently associated
        with the trajectory is displayed. As with waypoints, a trajectory can be
        duplicated or deleted. In addition, .csv files can be downloaded for the
        waypoints and trajectory.
      </p>
    </div>
  );
};

export default Info;
