# @alasdair/api-builder-plugin-flow

This is a plugin for [API Builder](https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder.html) that provides a event flow-trigger that is used to invoke flows and return their response.

This is a plugin to let flows invoke other reusable flows from the API Builder flow editor.

## Installation

You can install this plugin into an existing API Builder project.  Follow the [Getting Started Guide](https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/api_builder_getting_started_guide.html) to create an API Builder service if you do not already have one.

```bash
$ npm install @alasdair/api-builder-plugin-flow
```

## Usage

When you install this plugin, you get a `Flow Listener` flow-trigger, and two flow-nodes: `Invoke Flow` and `Flow Listener Response`. 

`Flow Listener` provides a interface for your reusable Flow. Flows which have this listener must make use of the `Flow Listener Response` Flow-nodes in order to define what the flow will return or end with.
`Flow Listener` should be configured with a unique ID which can be used by any number of `Invoke Flow` flow-nodes to call this flow and wait for the response.
`Flow Listener` outputs `Data` which can be provided as a Flow input. This `Data` is provided by calls to `Invoke Flow`.


To make a reusable Flow, you will need to first drag a `Flow Listener` onto your flow. If your Flow requires input data, configure your *Flow Inputs* to assign `$.request` (Data) from the flow-trigger to one of the available Flow parameters. You should also assign your `Flow-Listener` with a unique `Flow listener ID`.

Drag one or more `Flow Response` flow-nodes onto your Flow where the flow should be returning, and configure it with any data to return, and if the response is an error. This will determine which output of the `Invoke Flow` flow-node gets called.

To finish, save your flow, and in another flow drag the `Invoke Flow` flow-node and configure it with the `Flow listener ID` and `data` required to invoke the reusable flow. 

## Changes

#### 0.0.3
- Update flow-trigger and flow-node names.
- Add documentation.
- Update icon.

#### 0.0.2
- Bugfixes and new `Flow Response` flow-node.

#### 0.0.1
- Initial release of Flow flow-trigger and flow-node.
