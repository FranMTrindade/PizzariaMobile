import React, {useEffect, useState}from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { api } from '../../services/api'
import { ModalPicker } from '../../components/modalPicker'
import { ListItem } from '../../components/ListItem'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackParmsList } from '../../Routes/app.routes'


 type RouteDetailParms = {
    Order:{
        number : string | number;
        order_id: string
    }
}

export type CategoryProps = {
    id: string;
    name: string;
}

type ProductProps = {
    id: string;
    name: string;
}

type ItemProps = {
    id: string;
    product_id: string;
    name: string;
    amout: string | number
}



type OrderRouteProps = RouteProp<RouteDetailParms, 'Order'> 


export default function Order(){

    const route = useRoute<OrderRouteProps>();
    const navigation = useNavigation<NativeStackNavigationProp<StackParmsList>>();

    const [category, setCategory] = useState<CategoryProps[] | []>([])
    const [ctgSelected, setCtgSelected] = useState<CategoryProps | undefined>()
    
    const [amount, setAmout] = useState('1')
    const [visibleModal, setVisibleModal] = useState(false)
    
    const [products, setProducts] = useState<ProductProps[]| []>([])
    const [productsSelected, setProductsSelected] = useState<ProductProps | undefined>()
    const [modalProduct, setModalProduct] = useState(false)

    const [items, setItems] = useState<ItemProps[]>([])

    useEffect(() => {
        async function loadInfo(){
            const response = await api.get('/category')

            setCategory(response.data);
            setCtgSelected(response.data[0])
        }
        
        loadInfo();
    }, [])

    useEffect(() => {
        async function loadProduct(){
            const resopnse = await api.get('/category/product', {
              params:{
                category_id: ctgSelected?.id
              }
            })

            setProducts(resopnse.data);
            setProductsSelected(resopnse.data[0])
        }
        loadProduct();
    }, [ctgSelected])

    async function handleCloseOrder(){
        
        try{
            await api.delete('/order', {
                params:{
                    order_id: route.params?.order_id
                    }
            })

            navigation.goBack();

        }catch(err){
            console.log(err)
        }
    }

    function handleChangeCategory(item: CategoryProps){
        setCtgSelected(item);
    }

    function handleChangeProduct(item: ProductProps){
        setProductsSelected(item)
    }

    async function handleAdd(){
        const response = await api.post('/order/add', {
            order_id: route.params?.order_id,
            product_id: productsSelected?.id,
            amount: Number(amount)
        })

        let data= {
            id: response.data.id,
            product_id: productsSelected?.id as string,
            name: productsSelected?.name as string,
            amount: amount
        }

        setItems(oldArray => [...oldArray, data])
    }

    async function handleDelete(item_id: string){
        await api.delete('/order/remove', {
            params:{
                item_id: item_id
            }
        })

        let removeItem = items.filter( item => {
            return(item.id !== item_id)
        })

        setItems(removeItem)

    }

    function handleFinishOrder(){
        navigation.navigate("FinishOrder", {number: route.params?.number,
        order_id: route.params?.order_id})
    }
   
    
    return(
    
    <View style={styles.container}>
         
         <View style={styles.header}>
           
            <Text style={styles.title}> Mesa {route.params.number}</Text>
            {items.length === 0 && (
            <TouchableOpacity onPress={handleCloseOrder}>
                <Feather name="trash-2" size={25} color="#FF3F4B"/>
            </TouchableOpacity>
            )}

       
        </View>

        {category.length !== 0 && (
            <TouchableOpacity style={styles.input} onPress={() => setVisibleModal(true)}>
                <Text>
                    {ctgSelected?.name}
                </Text>
            </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.input} onPress={() => setModalProduct(true)}>
            <Text>{productsSelected?.name}</Text>
        </TouchableOpacity>

        <View style={styles.quantidadeContainer}>      
            <Text style={styles.quantiaddeText}> Quantidade :</Text>
            <TextInput 
            keyboardType='numeric'
            style={[styles.input,{ width:'60%', textAlign: 'center'}]} 
            value={amount}
            onChangeText={setAmout}
            />      
        </View>

        

        <View style={styles.actions}>        
            <TouchableOpacity style={styles.buttonAdd} onPress={handleAdd}>
                <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button , {opacity: items.length === 0 ? 0.3 : 1}]} disabled={items.length === 0} onPress={handleFinishOrder}>
                <Text style={styles.buttonText}>Avançar</Text>
            </TouchableOpacity>
        </View>

        <FlatList 
        showsHorizontalScrollIndicator={false}
         style={{flex: 1, marginTop: 24}} 
         data={items} 
         keyExtractor= {(item) => item.id} 
         renderItem={({item}) => <ListItem data={item} deleteItem={handleDelete}/>}
         />

       
   
            <Modal 
            transparent={true} 
            visible={visibleModal} 
            animationType="fade"
            >
                <ModalPicker
                    handleClosaModal={ () => setVisibleModal(false)}
                    options={category}
                    selectedItem={handleChangeCategory}
                />
            </Modal>

            <Modal 
            transparent={true} 
            visible={modalProduct} 
            animationType="fade"
            >

                <ModalPicker
                    handleClosaModal={ () => setModalProduct(false)}
                    options={products}
                    selectedItem={handleChangeProduct}
                />

            </Modal>


   
    </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingVertical: '5%',
        paddingEnd: '4%',
        paddingStart: '4%',
        backgroundColor: '#FFF'
    },

    header:{
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
        marginTop: 24,
    },

    title:{
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        marginRight: 14
    },

    input:{
        backgroundColor: '#c0c0c0',
        borderRadius: 4,
        width: '100%',
        height: 40,
        marginBottom: 12,
        justifyContent: 'center',
        paddingHorizontal: 8  
    },

    quantidadeContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 25,
    },

    quantiaddeText:{
        fontSize: 20,
        fontWeight: 'bold',
    },

    actions:{
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
        
    },

    buttonAdd:{
        width: '20%',
        backgroundColor: '#3Fd1FF',
        borderRadius: 4,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText:{
        color: '#000',
        fontWeight: 'bold'
    },

    button:{
        backgroundColor: '#3FFFA3',
        borderTopRightRadius: 4,
        height: 40,
        width: '75%',
        alignItems: 'center',
        justifyContent: 'center'


    }


})