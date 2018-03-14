import React from 'react'
import { StyleSheet, Text, View, FlatList, TextInput, KeyboardAvoidingView } from 'react-native'
window.navigator.userAgent = 'react-native'
import io from 'socket.io-client'
import faker from 'faker'
import moment from 'moment'

export default class App extends React.Component {

  constructor () {
    super()
    const me = this
    const socket = io('https://app.yetcargo.melisa.mx:3001', {
      jsonp: false,
      pingInterval: 20000, 
      pingTimeout: 40000
    })
    me.state = {
      openDialogChangeName: false,
      connected: false,
      socket: socket,
      messages: [],
      message: '',
      username: `${faker.name.firstName()} ${faker.random.number()}`,
      users: []
    }
    socket.on('connect', me.onSocketConnect.bind(me))
    socket.on('message', me.onSocketMessage.bind(me))
    socket.on('disconnect', me.onSocketDisConnect.bind(me))
    socket.on('user.connected', me.onSocketUserConnected.bind(me))
    console.ignoredYellowBox = [
      'Setting a timer'
    ]
  }

  onSocketUserConnected (user) {
    this.state.users.push(user)
    this.setState({
      users: this.state.users
    })
  }

  onSocketMessage (message) {
    const me = this;
    me.addMessage(message);
  }

  onSocketConnect () {
    const me = this
    me.setState({
      connected: true
    })
    me.state.socket.emit('user.connected', {
      id: me.state.socket.id,
      username: me.state.username,
      date: moment().format('YYYY-MM-DD h:mm a')
    })
  }

  onSocketDisConnect () {
    this.setState({
      connected: false
    })
    console.log('disconnect')
  }

  onEndEditing () {
    if (!this.state.message) {
      return
    }
    this.sendMessage(this.state.message)
    this.setState({
      message: ''
    })
  }

  sendMessage (message) {
    const me = this;
    const messageObject = {
      message: message,
      username: me.state.username
    };
    me.addMessage(messageObject)
    me.state.socket.emit('message', messageObject)
  }

  addMessage (messageObject) {
    const me = this

    me.state.messages.push({
      id: me.state.messages.length + 1,
      message: messageObject.message,
      username: messageObject.username,
      date: moment().format('YYYY-MM-DD h:mm a')
    });
    me.setState({
      messages: me.state.messages
    });
  }

  getKeyMessages (item, index) {
    return item.id
  }

  renderItem (item) {
    return (
      <View id={item.item.id} style={styles.row}>
        <Text style={styles.username}>{item.item.username}</Text>
        <Text style={styles.message}>{item.item.message}</Text>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList 
          data={this.state.messages} 
          extraData={this.state}
          keyExtractor={this.getKeyMessages}
          renderItem={this.renderItem}
        />
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.footer}>
            <TextInput
              value={this.state.message}
              onChangeText={text => this.setState({message: text})}
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="Write the message"
              autoFocus={true}
              editable={this.state.connected}
              onEndEditing={this.onEndEditing.bind(this)}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  message: {
    fontSize: 18,
  },
  username: {
    fontWeight: 'bold',
    paddingRight: 10,
    color: '#000'
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    flex: 1,
  },
  rowText: {
      flex: 1
  },
  row: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
});
