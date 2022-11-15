import React from "react";
import PropTypes from "prop-types";
import Dialog from "./Dialog";

export default function SupportDialog({ onCancel, ...props }) {
  return (
    <Dialog {...props} title="Support">
      <div>
        <p>Need to report a problem?</p>
        <p>
          You can file a{" "}
          <a href="https://aptero.co/opal/docs/report-issue.html" target="_blank" rel="noopener noreferrer">
            GitHub Issue
          </a>{" "}
          or e-mail us for support at <a href="mailto:contact@aptero.co">constac@aptero.co</a>
        </p>
        <p>
          You can also find us on{" "}
          <a href="https://discord.gg/undefined" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </p>
      </div>
    </Dialog>
  );
}
SupportDialog.propTypes = {
  onCancel: PropTypes.func
};
