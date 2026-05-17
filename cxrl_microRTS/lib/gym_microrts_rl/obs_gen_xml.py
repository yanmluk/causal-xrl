from lxml import etree, objectify
import numpy as np

def rawobs_to_units(raw_obs):
    '''
    Serialize units given raw observation
    '''
    uht = raw_obs[0,:,:]
    urt = raw_obs[1,:,:]
    uot = raw_obs[2,:,:]
    utt = raw_obs[3,:,:]
    # get coordinates where's not empty
    rows,cols = (utt != 0).nonzero()
    coords = np.stack((rows, cols), axis=-1)
    unit_list = []
    ut_dict = {1:"Resource", 2:"Base", 3:"Barracks", 4:"Worker", 5:"Light", 6:"Heavy", 7:"Ranged"}  
    for i in range(coords.shape[0]):
        #construct unit dictionary
        unit = {}
        unit['type'] = ut_dict.get(utt[coords[i][0], coords[i][1]])
        unit['ID'] = str((i+16))
        # if unit type is resource
        if utt[coords[i][0], coords[i][1]] == 1:
            unit['player'] = "-1"  
        else:
            unit['player'] = str((uot[coords[i][0], coords[i][1]] - 1))
        unit['x'] = str(coords[i][1])
        unit['y'] = str(coords[i][0])
        unit['resources'] = str(urt[coords[i][0], coords[i][1]])
        unit['hitpoints'] = str(uht[coords[i][0], coords[i][1]])
        
        # append object to list
        unit_list.append(unit)
    return unit_list


def set_elem_attrs(data,elem):
    '''
    Set attributes for element
    '''
    for key,value in data.items():
        elem.set(key,value)
    elem.text=""
    return elem


def obs_to_xml(raw_obs, players_rsc, path_to_file):
    '''
    generate xml map based on raw observation
    '''
    # root element
    root = etree.Element("rts.PhysicalGameState")
    root.set("width","16")
    root.set("height","16")

    # terrain element
    terrain = etree.Element("terrain")
    terrain.text = ("".zfill(256))

    # players element
    players = etree.Element("players")
    # units element
    units = etree.Element("units")

    # relations
    root.append(terrain)
    root.append(players)
    root.append(units)
    rts_player = set_elem_attrs({"ID":"0", "resources":str(players_rsc[0])}, etree.Element("rts.Player"))
    players.append(rts_player)
    rts_player = set_elem_attrs({"ID":"1", "resources":str(players_rsc[1])}, etree.Element("rts.Player"))
    players.append(rts_player)
    
    # append set units attributes
    unit_list = rawobs_to_units(raw_obs) 
    for i in range(len(unit_list)):
        rts_unit = set_elem_attrs(unit_list[i], etree.Element("rts.units.Unit"))
        units.append(rts_unit)

    # remove lxml annotation
    objectify.deannotate(root)
    etree.cleanup_namespaces(root)

    # create the xml string
    obj_xml = etree.tostring(root,
                            pretty_print=True,
                            xml_declaration=False)
    # pretty print
    # print(etree.tostring(root, pretty_print=True).decode())

    # save to file
    try:
        with open(path_to_file, "wb") as xml_writer:
            xml_writer.write(obj_xml)
    except IOError:
        pass