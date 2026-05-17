import xml.etree.ElementTree as ET
import numpy as np
def xml_to_obs(xml_string):
    ut_dict = {"Resource":1, "Base":2, "Barracks":3, "Worker":4, "Light":5, "Heavy":6, "Ranged":7} 
    
    tree = ET.ElementTree(ET.fromstring(xml_string))
    root = tree.getroot()
    raw_obs = np.zeros((5, 16, 16), dtype=int)
    uht = np.zeros((16,16), dtype=int)
    urt = np.zeros((16,16), dtype=int)
    uot = np.zeros((16,16), dtype=int)
    utt = np.zeros((16,16), dtype=int)
    uat = np.zeros((16,16), dtype=int)
    player_urt_mat = np.zeros((16,16), dtype=int)
    for child in root:
        if child.tag == "players":
            
            p1_rsrc = int(child[0].attrib['resources'])
            p2_rsrc = int(child[1].attrib['resources'])
            # print("p1_rsrc",p1_rsrc, "p2_rsrc", p2_rsrc)
        elif child.tag == "units":
            for unit in child:
                
                type_i = unit.attrib['type']
                player_i = int(unit.attrib['player'])
                col_i = int(unit.attrib['x'])
                row_i = int(unit.attrib['y'])
                rsrc_i = int(unit.attrib['resources'])
                hp_i = int(unit.attrib['hitpoints'])

                # print(type_i, player_i, col_i, row_i, rsrc_i, hp_i)
                utt[row_i, col_i] = int(ut_dict[type_i])
                uot[row_i, col_i] = int(player_i + 1)
                uht[row_i, col_i] = int(hp_i)
                urt[row_i, col_i] = int(rsrc_i)
                if type_i == "Base":
                    # print(col_i, row_i, player_i, p1_rsrc, p2_rsrc)
                    if player_i == 0:
                        player_urt_mat[row_i, col_i] = p1_rsrc
                    elif player_i == 1:
                        player_urt_mat[row_i, col_i] = p2_rsrc
        else:
            pass


    raw_obs[0,:,:] = uht
    raw_obs[1,:,:] = urt
    raw_obs[2,:,:] = uot
    raw_obs[3,:,:] = utt
    raw_obs[4,:,:] = uat

    return raw_obs, player_urt_mat
