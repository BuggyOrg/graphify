import React, { Component } from 'react'
import { GraphViewer } from '@buggyorg/graphify-react'
import Editor from '../components/EnhancedEditor'

const style = {

}

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = { graph: {} }
  }

  render () {
    <div>
      <Editor
        value={this.state.graph}
        onChange={(value) => this.setState({ graph: value })}
      />
      <GraphViewer kgraph={JSON.parse(this.state.graph)} />
    </div>
  }
}
