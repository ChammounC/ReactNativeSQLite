import React, {useState, useEffect} from 'react';
import {
  Button,
  StatusBar,
  TextInput,
  View,
  FlatList,
  Text,
  TouchableNativeFeedback,
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({
  name: 'sqlite',
});

const App = () => {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const createTable = () => {
    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20))`,
        [],
        (sqlTxn, res) => {
          // console.log('table created');
        },
        error => {
          console.log('error creating table' + error.message);
        },
      );
    });
  };

  const addCategory = () => {
    if (!category) {
      // console.log('Enter category');
      return false;
    }

    db.transaction(txn => {
      txn.executeSql(
        `INSERT INTO categories (name) VALUES (?)`,
        [category],
        (sqlTxn, res) => {
          // console.log(`${category} input added successfully`);
          getCategories();
        },
        error => {
          console.log('error adding' + error.message);
        },
      );
    });
  };

  const getCategories = () => {
    db.transaction(txn => {
      txn.executeSql(
        `SELECT * FROM categories ORDER BY id DESC`,
        [],
        (sqlTxn, res) => {
          // console.log('Category received successfully');

          let len = res.rows.length;

          if (len > 0) {
            let results = [];
            for (let i = 0; i < len; i++) {
              let item = res.rows.item(i);
              results.unshift({id: item.id, name: item.name});
            }
            setCategories(results);
          }
        },
        error => {
          console.log('error getting infos' + error.message);
        },
      );
    });
  };

  const deleteCategories = item => {
    db.transaction(txn => {
      txn.executeSql(
        `DELETE from categories WHERE id = (?)`,
        [item],
        (sqlTxn, res) => {
          console.log('deletion complete');
          getCategories();
          if (categories.length - 1 === 0) {
            txn.executeSql(`DROP TABLE categories `);
          }
        },
        error => {
          console.log('deletion failed' + error.message);
        },
      );
    });
  };

  const renderCategories = ({item}) => {
    return (
      <TouchableNativeFeedback onPress={() => deleteCategories(item.id)}>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderBottomWidth: 1,
            borderColor: '#ddd',
          }}>
          <Text style={{marginRight: 9}}>
            {item.id} {item.name}
          </Text>
        </View>
      </TouchableNativeFeedback>
    );
  };

  useEffect(() => {
    createTable();
    getCategories();
  }, []);

  return (
    <View style={{padding: 20}}>
      <StatusBar backgroundColor="orange" />
      <TextInput
        placeholder="Enter Text"
        value={category}
        onChangeText={setCategory}
        style={{borderWidth: 1, borderColor: 'yellow', marginBottom: 20}}
      />
      <Button title="Submit" onPress={addCategory} />
      <View style={{borderWidth: 1, borderColor: 'white', marginVertical: 15}}>
        <FlatList
          data={categories}
          renderItem={renderCategories}
          key={cat => cat.id}
        />
      </View>
    </View>
  );
};

export default App;
