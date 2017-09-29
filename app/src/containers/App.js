import React, { Component } from 'react'
import { GraphViewer } from '@buggyorg/graphify-react'
import SplitPane from 'react-split-pane'
import Editor from '../components/EnhancedEditor'

const styles = {
  root: {
  },
  editor: {
    width: 'auto'
  },
  graphWrapper: {
    height: '100%'
  },
  graph: {
    width: '100%',
    height: '100%'
  },
  error: {
    position: 'relative',
    top: 0,
    zIndex: 42
  }
}

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = { graph: '', graphObject: null }
  }
  
  componentDidMount () {
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize = () => {
    this.editor.layout()
  }

  setEditor = (editor) => {
    this.editor = editor
  }

  setGraphViewer = (graphViewer) => {
    this.graphViewer = graphViewer
  }

  handleChange = (value) => {
    let graphObject = null
    try {
      graphObject = JSON.parse(value)
    } catch (e) {
      // TODO
    }
    this.setState({ graph: value, graphObject })
  }

  handleError = (error) => {
    this.setState({ error })
  }

  render () {
    const { graph, graphObject, error } = this.state

    return (
      <div style={styles.root}>
        <SplitPane
          split='vertical'
          defaultSize='50%'
          onDragFinished={this.handleResize}
        >
          <Editor
            ref={this.setEditor}
            value={graph}
            onChange={this.handleChange}
            style={styles.editor}
            language='json'
          />
          <div style={styles.graphWrapper}>
            {error && (<div style={styles.error}>{error}</div>)}
            <GraphViewer
              ref={this.setGraphViewer}
              kgraph={graphObject}
              style={styles.graph}
              onError={this.handleError}
            />
          </div>
        </SplitPane>
      </div>
    )
  }
}
